'use client';

import { FileText, AudioLines, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type?: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onReorder?: (from: number, to: number) => void;
  showReorder?: boolean;
  className?: string;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac', 'wma'].includes(ext)) {
    return <AudioLines className="size-4 shrink-0 text-muted-foreground" />;
  }
  return <FileText className="size-4 shrink-0 text-muted-foreground" />;
}

export default function FileList({
  files,
  onRemove,
  onReorder,
  showReorder = false,
  className,
}: FileListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-primary/25"
          >
            {showReorder && onReorder && (
              <div className="flex flex-col -space-y-1">
                <button
                  type="button"
                  onClick={() => index > 0 && onReorder(index, index - 1)}
                  disabled={index === 0}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => index < files.length - 1 && onReorder(index, index + 1)}
                  disabled={index === files.length - 1}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="size-3" />
                </button>
              </div>
            )}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              {getFileIcon(file.name)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </span>
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${file.name}`}
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
