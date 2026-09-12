'use client';

import { useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileStack, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import ToolHeader from '@/components/shared/ToolHeader';
import FileDropzone from '@/components/shared/FileDropzone';
import FileList from '@/components/shared/FileList';
import DownloadButton from '@/components/shared/DownloadButton';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/useFileStore';
import { runPdfJob } from '@/lib/workers/client';

export default function MergePdfPage() {
  const store = useFileStore();

  // Reset store on unmount so state doesn't leak between pages
  useEffect(() => () => store.reset(), []);

  const mutation = useMutation({
    mutationFn: async () => {
      store.setProcessing();
      const files = await Promise.all(
        store.files.map(async (f) => ({
          data: new Uint8Array(await f.blob.arrayBuffer()),
          name: f.name,
        }))
      );
      const result = await runPdfJob(
        { type: 'merge', files },
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
      }
    },
    onError: (err: Error) => {
      store.setError(err.message);
    },
  });

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      store.addFiles(newFiles);
    },
    [store]
  );

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 md:gap-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ToolHeader
          icon={FileStack}
          title="Merge PDF"
          description="Combine multiple PDFs into one file"
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
          message="Merging PDFs..."
        />

        <FileDropzone
          accept="application/pdf"
          multiple
          onFiles={handleFiles}
          label="Drop PDFs here or click to browse"
          hint="Select two or more PDFs to merge"
        />
      </motion.div>

      {store.files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FileList
            files={store.files}
            onRemove={store.removeFile}
            onReorder={store.reorder}
            showReorder
          />
        </motion.div>
      )}

      {store.files.length >= 2 && store.status === 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => mutation.mutate()}
            disabled={store.isProcessing}
            className="w-full"
            size="lg"
          >
            {store.isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <FileStack className="size-4" />
                Merge PDFs
              </>
            )}
          </Button>
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
              PDF merged successfully!
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
