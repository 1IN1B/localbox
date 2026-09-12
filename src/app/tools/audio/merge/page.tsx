'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AudioLines, Music, FileAudio, Disc3, Radio, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFileStore } from '@/stores/useFileStore';
import { runAudioJob } from '@/lib/workers/client';
import ToolHeader from '@/components/shared/ToolHeader';
import FileDropzone from '@/components/shared/FileDropzone';
import FileList from '@/components/shared/FileList';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import DownloadButton from '@/components/shared/DownloadButton';

type OutputFormat = 'mp3' | 'wav' | 'm4a' | 'ogg';

const FORMAT_OPTIONS: { value: OutputFormat; label: string; icon: typeof Music }[] = [
  { value: 'mp3', label: 'MP3', icon: Music },
  { value: 'wav', label: 'WAV', icon: FileAudio },
  { value: 'm4a', label: 'M4A', icon: Disc3 },
  { value: 'ogg', label: 'OGG', icon: Radio },
];

export default function MergeAudioPage() {
  const store = useFileStore();
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
  const [progressMessage, setProgressMessage] = useState('Processing...');

  useEffect(() => {
    return () => store.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      store.setProcessing();
      setProgressMessage('Processing...');

      const files = await Promise.all(
        store.files.map(async (f) => ({
          data: new Uint8Array(await f.blob.arrayBuffer()),
          name: f.name,
        }))
      );

      const result = await runAudioJob(
        { type: 'merge', files, outputFormat },
        (p) => {
          store.setProgress(p.progress);
          setProgressMessage(p.message);
        }
      );

      const ext = outputFormat;
      const blob = new Blob([result.data.buffer as ArrayBuffer], { type: `audio/${ext}` });
      const name = result.name || `merged.${ext}`;
      store.setDone(blob, name);
      return { blob, name };
    },
    onError: (error: Error) => {
      store.setError(error.message || 'Failed to merge audio files');
    },
  });

  const handleMerge = () => {
    if (store.files.length < 2) return;
    mutation.mutate();
  };

  const canMerge = store.files.length >= 2 && !store.isProcessing;

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <ToolHeader
          icon={AudioLines}
          title="Merge Audio"
          description="Combine multiple audio files into one"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="relative"
      >
        <FileDropzone
          accept="audio/*"
          multiple
          onFiles={(files) => store.addFiles(files)}
          label="Drop audio files here"
          hint="MP3, WAV, M4A, OGG — as many as you need"
        />

        <ProcessingOverlay
          open={store.isProcessing}
          progress={store.progress}
          message={progressMessage}
        />
      </motion.div>

      {store.files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <FileList
            files={store.files}
            onRemove={(id) => store.removeFile(id)}
            onReorder={(from, to) => store.reorder(from, to)}
            showReorder
          />
        </motion.div>
      )}

      {/* Output Format Selector */}
      {store.files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-muted-foreground">Output Format</p>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = outputFormat === fmt.value;
              return (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setOutputFormat(fmt.value)}
                  disabled={store.isProcessing}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    store.isProcessing && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon className="size-4" />
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Merge Button */}
      {store.files.length > 0 && store.status !== 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Button
            onClick={handleMerge}
            disabled={!canMerge}
            className="w-full sm:w-auto"
          >
            {store.isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <AudioLines className="size-4" />
                Merge Audio
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {store.status === 'error' && store.error && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Merge failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{store.error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {store.status === 'done' && store.result && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Merge complete</p>
                <p className="text-xs text-muted-foreground">
                  {store.files.length} files combined into {store.result.name}
                </p>
              </div>
            </div>
            <DownloadButton blob={store.result.blob} filename={store.result.name}>
              Download merged audio
            </DownloadButton>
            <Button
              variant="outline"
              onClick={() => {
                store.reset();
                store.clear();
              }}
            >
              Merge more files
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-lg border border-border bg-muted/30 p-4"
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          Audio is processed locally via ffmpeg.wasm — first use downloads the engine (~32 MB) once.
          Your files never leave your browser.
        </p>
      </motion.div>
    </div>
  );
}
