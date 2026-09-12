'use client';

import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ScissorsLineDashed,
  Music,
  FileAudio,
  Disc3,
  Radio,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFileStore } from '@/stores/useFileStore';
import { runAudioJob } from '@/lib/workers/client';
import ToolHeader from '@/components/shared/ToolHeader';
import FileDropzone from '@/components/shared/FileDropzone';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import DownloadButton from '@/components/shared/DownloadButton';

type OutputFormat = 'mp3' | 'wav' | 'm4a' | 'ogg';

const FORMAT_OPTIONS: { value: OutputFormat; label: string; icon: typeof Music }[] = [
  { value: 'mp3', label: 'MP3', icon: Music },
  { value: 'wav', label: 'WAV', icon: FileAudio },
  { value: 'm4a', label: 'M4A', icon: Disc3 },
  { value: 'ogg', label: 'OGG', icon: Radio },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrimAudioPage() {
  const store = useFileStore();
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Processing...');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      store.reset();
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load audio duration when file changes
  useEffect(() => {
    if (store.files.length === 0) {
      setDuration(0);
      setTrimStart(0);
      setTrimEnd(0);
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
        setAudioPreviewUrl(null);
      }
      return;
    }

    const file = store.files[0];
    const url = URL.createObjectURL(file.blob);
    setAudioPreviewUrl(url);

    const audio = new Audio();
    audio.src = url;

    const handleLoaded = () => {
      const dur = audio.duration;
      if (isFinite(dur) && dur > 0) {
        setDuration(dur);
        setTrimEnd(dur);
        setTrimStart(0);
      }
    };

    audio.onloadedmetadata = handleLoaded;

    return () => {
      audio.onloadedmetadata = null;
      URL.revokeObjectURL(url);
    };
  }, [store.files]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: async () => {
      store.setProcessing();
      setProgressMessage('Processing...');

      const file = store.files[0];
      const fileData = new Uint8Array(await file.blob.arrayBuffer());

      const result = await runAudioJob(
        { type: 'trim', file: fileData, start: trimStart, end: trimEnd, outputFormat },
        (p) => {
          store.setProgress(p.progress);
          setProgressMessage(p.message);
        }
      );

      const ext = outputFormat;
      const blob = new Blob([result.data.buffer as ArrayBuffer], { type: `audio/${ext}` });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const name = result.name || `${baseName}_trimmed.${ext}`;
      store.setDone(blob, name);
      return { blob, name };
    },
    onError: (error: Error) => {
      store.setError(error.message || 'Failed to trim audio');
    },
  });

  const handleTrim = () => {
    if (store.files.length === 0 || trimStart >= trimEnd) return;
    mutation.mutate();
  };

  const canTrim = store.files.length > 0 && duration > 0 && trimStart < trimEnd && !store.isProcessing;

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <ToolHeader
          icon={ScissorsLineDashed}
          title="Trim Audio"
          description="Cut a segment out of an audio file"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="relative"
      >
        {store.files.length === 0 ? (
          <FileDropzone
            accept="audio/*"
            multiple={false}
            onFiles={(files) => store.addFiles(files)}
            label="Drop an audio file here"
            hint="MP3, WAV, M4A, OGG"
          />
        ) : (
          <div className="space-y-4">
            {/* File info & audio preview */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{store.files[0].name}</p>
                  <p className="text-xs text-muted-foreground">
                    Duration: {formatTime(duration)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    store.clear();
                    setDuration(0);
                    setTrimStart(0);
                    setTrimEnd(0);
                    if (audioPreviewUrl) {
                      URL.revokeObjectURL(audioPreviewUrl);
                      setAudioPreviewUrl(null);
                    }
                  }}
                  className="shrink-0"
                >
                  <span className="sr-only">Remove file</span>
                  <span className="text-lg leading-none">&times;</span>
                </Button>
              </div>

              {/* Native audio player */}
              {audioPreviewUrl && (
                <audio
                  ref={audioRef}
                  src={audioPreviewUrl}
                  controls
                  className="mt-3 w-full"
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>

            {/* Trim Controls */}
            {duration > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="space-y-4 rounded-xl border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Trim Range</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="font-mono text-foreground">{formatTime(trimStart)}</span>
                    <span>&mdash;</span>
                    <span className="font-mono text-foreground">{formatTime(trimEnd)}</span>
                    <span className="ml-1 text-xs">
                      ({formatTime(trimEnd - trimStart)} selected)
                    </span>
                  </div>
                </div>

                {/* Start slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="trim-start" className="text-xs text-muted-foreground">
                      Start
                    </label>
                    <span className="font-mono text-xs text-foreground">{formatTime(trimStart)}</span>
                  </div>
                  <input
                    id="trim-start"
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < trimEnd) setTrimStart(val);
                    }}
                    disabled={store.isProcessing}
                    className="w-full accent-primary"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </div>

                {/* End slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="trim-end" className="text-xs text-muted-foreground">
                      End
                    </label>
                    <span className="font-mono text-xs text-foreground">{formatTime(trimEnd)}</span>
                  </div>
                  <input
                    id="trim-end"
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val > trimStart) setTrimEnd(val);
                    }}
                    disabled={store.isProcessing}
                    className="w-full accent-primary"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </div>

                {/* Quick preset buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTrimStart(0);
                      setTrimEnd(duration);
                    }}
                    disabled={store.isProcessing}
                  >
                    Full length
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const mid = duration / 2;
                      setTrimStart(0);
                      setTrimEnd(mid);
                    }}
                    disabled={store.isProcessing}
                  >
                    First half
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const mid = duration / 2;
                      setTrimStart(mid);
                      setTrimEnd(duration);
                    }}
                    disabled={store.isProcessing}
                  >
                    Second half
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <ProcessingOverlay
          open={store.isProcessing}
          progress={store.progress}
          message={progressMessage}
        />
      </motion.div>

      {/* Output Format Selector */}
      {store.files.length > 0 && duration > 0 && (
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

      {/* Trim Button */}
      {store.files.length > 0 && duration > 0 && store.status !== 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Button
            onClick={handleTrim}
            disabled={!canTrim}
            className="w-full sm:w-auto"
          >
            {store.isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Trimming...
              </>
            ) : (
              <>
                <ScissorsLineDashed className="size-4" />
                Trim Audio
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
              <p className="text-sm font-medium text-destructive">Trim failed</p>
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
                <p className="text-sm font-medium">Trim complete</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(trimStart)} &mdash; {formatTime(trimEnd)} ({formatTime(trimEnd - trimStart)} segment)
                </p>
              </div>
            </div>
            <DownloadButton blob={store.result.blob} filename={store.result.name}>
              Download trimmed audio
            </DownloadButton>
            <Button
              variant="outline"
              onClick={() => {
                store.reset();
              }}
            >
              Trim another segment
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
