'use client';

import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ProcessingOverlayProps {
  open: boolean;
  progress: number;
  message: string;
  className?: string;
}

export default function ProcessingOverlay({
  open,
  progress,
  message,
  className,
}: ProcessingOverlayProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl bg-background/70 p-4 backdrop-blur-md',
        className
      )}
    >
      <div className="glass-panel flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-border/70 p-6 text-center shadow-xl">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>

        <div className="w-full max-w-xs">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.round(progress * 100)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
