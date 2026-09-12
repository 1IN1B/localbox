'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Scissors, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument } from 'pdf-lib';

import ToolHeader from '@/components/shared/ToolHeader';
import FileDropzone from '@/components/shared/FileDropzone';
import DownloadButton from '@/components/shared/DownloadButton';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/useFileStore';
import { formatBytes } from '@/lib/utils';
import { runPdfJob } from '@/lib/workers/client';
import { trackOperation } from '@/lib/analytics/client';

export default function SplitPdfPage() {
  const store = useFileStore();
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(1);

  // Reset store on unmount
  useEffect(() => () => store.reset(), []);

  // Load page count when file changes
  useEffect(() => {
    if (store.files.length === 0) {
      setTotalPages(null);
      return;
    }
    const file = store.files[0];
    let cancelled = false;

    (async () => {
      try {
        const bytes = new Uint8Array(await file.blob.arrayBuffer());
        const doc = await PDFDocument.load(bytes);
        if (!cancelled) {
          const count = doc.getPageCount();
          setTotalPages(count);
          setFrom(1);
          setTo(count);
        }
      } catch {
        if (!cancelled) setTotalPages(null);
      }
    })();

    return () => { cancelled = true; };
  }, [store.files]);

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      store.reset();
      // Take only the first file
      if (newFiles.length > 0) {
        store.addFiles([newFiles[0]]);
      }
    },
    [store]
  );

  const isValidRange =
    totalPages !== null &&
    from >= 1 &&
    to <= totalPages &&
    from <= to &&
    store.files.length === 1;

  const mutation = useMutation({
    mutationFn: async () => {
      store.setProcessing();
      const file = store.files[0];
      const data = new Uint8Array(await file.blob.arrayBuffer());
      const result = await runPdfJob(
        { type: 'split', file: data, from, to },
        (p) => store.setProgress(p.progress)
      );
      return result;
    },
    onSuccess: (result) => {
      if ('data' in result) {
        store.setDone(
          new Blob([result.data.buffer as ArrayBuffer], { type: 'application/pdf' }),
          result.name
        );
        void trackOperation('pdf-trim');
      }
    },
    onError: (err: Error) => {
      store.setError(err.message);
    },
  });

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 md:gap-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ToolHeader
          icon={Scissors}
          title="Trim PDF"
          description="Extract a page range from a PDF"
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
          message="Extracting pages..."
        />

        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          label="Drop a PDF here or click to browse"
          hint="Select a single PDF to trim"
        />
      </motion.div>

      {store.files.length === 1 && totalPages !== null && (
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
              {totalPages} {totalPages === 1 ? 'page' : 'pages'} total
            </p>
          </div>

          {/* Page range inputs */}
          <div className="rounded-xl border bg-card p-4">
            <label className="mb-3 block text-sm font-medium">
              Page Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label
                  htmlFor="from-page"
                  className="mb-1 block text-xs text-muted-foreground"
                >
                  From
                </label>
                <input
                  id="from-page"
                  type="number"
                  min={1}
                  max={totalPages}
                  value={from}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setFrom(v);
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="mt-5 text-muted-foreground">&ndash;</span>
              <div className="flex-1">
                <label
                  htmlFor="to-page"
                  className="mb-1 block text-xs text-muted-foreground"
                >
                  To
                </label>
                <input
                  id="to-page"
                  type="number"
                  min={1}
                  max={totalPages}
                  value={to}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setTo(v);
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Extract pages {from} through {to}{' '}
              ({Math.max(0, to - from + 1)}{' '}
              {to - from + 1 === 1 ? 'page' : 'pages'})
            </p>
          </div>

          {/* Extract button */}
          {store.status === 'idle' && (
            <Button
              onClick={() => mutation.mutate()}
              disabled={!isValidRange || store.isProcessing}
              className="w-full"
              size="lg"
            >
              {store.isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Scissors className="size-4" />
                  Extract Pages
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
              Pages extracted successfully!
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
