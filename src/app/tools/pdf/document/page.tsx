'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { renderHtmlToCanvas, sliceCanvasIntoPages } from '@/lib/docx-render';

import ToolHeader from '@/components/shared/ToolHeader';
import FileDropzone from '@/components/shared/FileDropzone';
import DownloadButton from '@/components/shared/DownloadButton';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/useFileStore';
import { formatBytes } from '@/lib/utils';
import { runPdfJob } from '@/lib/workers/client';
import { trackOperation } from '@/lib/analytics/client';
import type { FileItem } from '@/stores/useFileStore';

type FileKind = 'docx' | 'txt' | 'md';

function detectKind(file: FileItem): FileKind {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md';
  return 'txt';
}

/** Slice a tall canvas into A4-sized page chunks */
export default function DocumentToPdfPage() {
  const store = useFileStore();
  const [kind, setKind] = useState<FileKind | null>(null);

  // Reset store on unmount
  useEffect(() => () => store.reset(), []);

  // Detect kind when file changes
  useEffect(() => {
    if (store.files.length > 0) {
      setKind(detectKind(store.files[0]));
    } else {
      setKind(null);
    }
  }, [store.files]);

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      store.reset();
      if (newFiles.length > 0) {
        store.addFiles([newFiles[0]]);
      }
    },
    [store]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      store.setProcessing();
      const file = store.files[0];
      const data = new Uint8Array(await file.blob.arrayBuffer());
      const fileKind = detectKind(file);

      if (fileKind === 'docx') {
        // Step 1: Get HTML from worker
        const step1 = await runPdfJob(
          { type: 'doc-to-pdf', file: data, kind: 'docx' },
          (p) => store.setProgress(p.progress * 0.3)
        );

        if (!('html' in step1)) {
          throw new Error('Expected HTML response from DOCX conversion');
        }

        // Step 2: Render HTML to canvas on main thread
        store.setProgress(0.35);

        const canvas = await renderHtmlToCanvas(step1.html);
        store.setProgress(0.65);

        // Step 3: Slice into pages
        const slices = sliceCanvasIntoPages(canvas);
        store.setProgress(0.7);

        // Step 4: Send slices back to worker for final PDF
        const step2 = await runPdfJob(
          {
            type: 'doc-to-pdf',
            file: data,
            kind: 'docx',
            html: step1.html,
            canvasImages: slices,
          },
          (p) => store.setProgress(0.7 + p.progress * 0.3)
        );

        return step2;
      }

      // TXT/MD — single step
      const result = await runPdfJob(
        { type: 'doc-to-pdf', file: data, kind: fileKind },
        (p) => store.setProgress(p.progress)
      );
      return result;
    },
    onSuccess: (result) => {
      if ('data' in result) {
        const file = store.files[0];
        store.setDone(
          new Blob([result.data.buffer as ArrayBuffer], { type: 'application/pdf' }),
          `${file.name.replace(/\.[^.]+$/, '')}.pdf`
        );
        void trackOperation('document-to-pdf');
      }
    },
    onError: (err: Error) => {
      store.setError(err.message);
    },
  });

  const kindLabel = kind === 'docx' ? 'DOCX' : kind === 'md' ? 'Markdown' : 'TXT';

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 md:gap-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ToolHeader
          icon={FileText}
          title="Document to PDF"
          description="Convert DOCX, TXT, or Markdown to PDF"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <ProcessingOverlay
          open={store.isProcessing}
          progress={store.progress}
          message={
            kind === 'docx'
              ? 'Converting document...'
              : 'Creating PDF...'
          }
        />

        <FileDropzone
          accept=".docx,.txt,.md,.markdown"
          multiple={false}
          onFiles={handleFiles}
          label="Drop a document here or click to browse"
          hint="Supports DOCX, TXT, and Markdown files"
        />
      </motion.div>

      {store.files.length === 1 && kind && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* File info */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-medium">
                {store.files[0].name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(store.files[0].size)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Detected format: {kindLabel}
            </p>
          </div>

          {/* DOCX note */}
          {kind === 'docx' && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                DOCX conversion renders as images &mdash; text won&apos;t be
                selectable. TXT/MD produce selectable text.
              </p>
            </div>
          )}

          {/* Convert button */}
          {store.status === 'idle' && (
            <Button
              onClick={() => mutation.mutate()}
              disabled={store.isProcessing}
              className="w-full"
              size="lg"
            >
              {store.isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  Convert to PDF
                </>
              )}
            </Button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {store.status === 'done' && store.result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center"
          >
            <p className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Document converted successfully!
            </p>
            <DownloadButton
              blob={store.result.blob}
              filename={store.result.name}
              className="w-full sm:w-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {store.status === 'error' && store.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center"
          >
            <p className="text-sm font-medium text-destructive">
              {store.error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
