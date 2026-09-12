'use client';

import { useCallback, useRef, useState } from 'react';
import { ArrowUpRight, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export default function FileDropzone({
  accept,
  multiple = true,
  onFiles,
  label = 'Drop files here',
  hint = 'or click to browse',
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      onFiles(Array.from(fileList));
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFiles]
  );

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-3xl border border-dashed p-8 text-center transition-all duration-300 sm:p-12',
        'hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-lg hover:shadow-primary/5',
        isDragging
          ? 'border-primary bg-primary/[0.08] shadow-lg shadow-primary/10'
          : 'border-border/80 bg-card/50',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)_0%,transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.035]" />
      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15"
        >
          <UploadCloud className="size-6 text-primary" />
        </motion.div>
        <div>
          <p className="text-base font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background shadow-sm transition-transform group-hover:-translate-y-0.5">
          Choose files <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
