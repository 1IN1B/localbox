'use client';

import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function ToolHeader({
  icon: Icon,
  title,
  description,
  className,
}: ToolHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <Link
        href="/"
        className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:-translate-x-0.5 hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Home
      </Link>
      <div className="glass-panel flex items-center gap-4 rounded-3xl border border-border/70 p-4 sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-primary-foreground shadow-lg shadow-primary/20">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-[-0.035em] sm:text-2xl">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
