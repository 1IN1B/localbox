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
        'absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 p-6">
        <Loader2 className="size-8 animate-spin text-primary" />

        <div className="w-full max-w-xs">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
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
