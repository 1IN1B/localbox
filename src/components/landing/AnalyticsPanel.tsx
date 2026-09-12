'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AudioLines,
  BarChart3,
  CheckCircle2,
  FileStack,
  FileText,
  ImagePlus,
  Scissors,
  ScissorsLineDashed,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { recordLandingVisit } from '@/lib/analytics/client';
import { operationLabels, type AnalyticsSnapshot, type OperationName } from '@/lib/analytics/types';

/** Tool metadata for colorful cards and breakdown */
const toolMetadata: Record<
  OperationName,
  {
    icon: typeof FileStack;
    gradient: string;
    bg: string;
    border: string;
    barColor: string;
  }
> = {
  'pdf-merge': {
    icon: FileStack,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/15',
    border: 'border-blue-500/20',
    barColor: 'from-blue-500 to-indigo-600',
  },
  'pdf-trim': {
    icon: Scissors,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/15',
    border: 'border-violet-500/20',
    barColor: 'from-violet-500 to-purple-600',
  },
  'images-to-pdf': {
    icon: ImagePlus,
    gradient: 'from-fuchsia-500 to-pink-600',
    bg: 'bg-fuchsia-500/10 text-fuchsia-500 dark:bg-fuchsia-500/15',
    border: 'border-fuchsia-500/20',
    barColor: 'from-fuchsia-500 to-pink-600',
  },
  'document-to-pdf': {
    icon: FileText,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15',
    border: 'border-amber-500/20',
    barColor: 'from-amber-500 to-orange-600',
  },
  'audio-merge': {
    icon: AudioLines,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15',
    border: 'border-emerald-500/20',
    barColor: 'from-emerald-500 to-teal-600',
  },
  'audio-trim': {
    icon: ScissorsLineDashed,
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/15',
    border: 'border-rose-500/20',
    barColor: 'from-rose-500 to-red-600',
  },
};

const ALL_OPERATIONS = Object.keys(operationLabels) as OperationName[];

/** Eased animated number counter component */
function AnimatedNumber({ value, duration = 1600 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const prevValue = useRef(0);

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    const start = prevValue.current;
    const end = value;
    const diff = end - start;

    if (diff === 0) {
      setDisplayValue(end);
      return;
    }

    let rafId: number;
    const step = (now: number) => {
      if (!startTimestamp) startTimestamp = now;
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + diff * ease));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevValue.current = end;
        setDisplayValue(end);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString()}
    </span>
  );
}

/** Human-friendly relative time formatter */
function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    const onAnalytics = (event: Event) => setAnalytics((event as CustomEvent<AnalyticsSnapshot>).detail);
    window.addEventListener('localbox:analytics', onAnalytics);

    if (!recorded.current) {
      recorded.current = true;
      void recordLandingVisit().then((snapshot) => {
        if (snapshot) setAnalytics(snapshot);
      });
    }

    return () => window.removeEventListener('localbox:analytics', onAnalytics);
  }, []);

  if (!analytics) return null;

  // Build full tool statistics map (ensuring all 6 tools are represented)
  const operationCountMap = new Map<OperationName, number>();
  for (const op of ALL_OPERATIONS) {
    operationCountMap.set(op, 0);
  }
  for (const item of analytics.stats.operations) {
    operationCountMap.set(item.operation, item.count);
  }

  // Sort by count descending, then by label
  const sortedOperations = ALL_OPERATIONS.map((op) => ({
    operation: op,
    count: operationCountMap.get(op) ?? 0,
  })).sort((a, b) => b.count - a.count || operationLabels[a.operation].localeCompare(operationLabels[b.operation]));

  const totalOps = Math.max(analytics.stats.totalOperations, 1);

  return (
    <section aria-label="Localbox activity metrics" className="relative border-y border-border/60 bg-muted/30 py-16 sm:py-24">
      {/* Background glow overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)_0%,transparent_50%)] opacity-[0.03]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live Platform Telemetry
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Trusted by creators across the globe
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Real-time aggregate activity across all visitors. Every single operation runs 100% locally in browser memory with zero file uploads.
          </p>
        </motion.div>

        {/* 3 Large Marketing Metric Cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Total Site Visits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <BarChart3 className="size-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="size-3" />
                Page Sessions
              </span>
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              <AnimatedNumber value={analytics.stats.totalVisits} />
            </div>
            <h3 className="mt-2 text-base font-semibold text-foreground">Total Site Visitors</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Cumulative visits logged across all browsers and devices.
            </p>
          </motion.div>

          {/* Unique Visitors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20">
                <Users className="size-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                <Users className="size-3" />
                Worldwide
              </span>
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              <AnimatedNumber value={analytics.stats.uniqueVisitors} />
            </div>
            <h3 className="mt-2 text-base font-semibold text-foreground">Unique Visitors</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Distinct individual browsers served with zero tracking cookies.
            </p>
          </motion.div>

          {/* Total Operations Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                <Zap className="size-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                100% Local
              </span>
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              <AnimatedNumber value={analytics.stats.totalOperations} />
            </div>
            <h3 className="mt-2 text-base font-semibold text-foreground">Operations Completed</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Files merged, trimmed, and converted entirely on client hardware.
            </p>
          </motion.div>
        </div>

        {/* 2-Column Deep Dive: Operations Breakdown & Global Live Activity Stream */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Operations by Tool Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground sm:text-xl">Operations by Tool</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">Total volume processed across each utility</p>
              </div>
              <span className="rounded-xl border border-border/70 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                All-time
              </span>
            </div>

            <div className="space-y-4">
              {sortedOperations.map(({ operation, count }) => {
                const meta = toolMetadata[operation];
                const Icon = meta.icon;
                const percentage = analytics.stats.totalOperations > 0 ? Math.round((count / totalOps) * 100) : 0;

                return (
                  <div key={operation} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex size-7 items-center justify-center rounded-lg ${meta.bg}`}>
                          <Icon className="size-4" />
                        </div>
                        <span className="font-medium text-foreground">{operationLabels[operation]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums text-foreground">
                          <AnimatedNumber value={count} />
                        </span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(percentage, count > 0 ? 6 : 0)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${meta.barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Live Recent Operations Activity Stream */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="flex flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="size-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-foreground sm:text-xl">Recent Global Activity</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Latest operations completed across all users</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            {analytics.activity.length > 0 ? (
              <ol className="flex-1 space-y-3">
                {analytics.activity.map((item, index) => {
                  const meta = toolMetadata[item.operation];
                  const Icon = meta ? meta.icon : Activity;

                  return (
                    <motion.li
                      key={`${item.performedAt}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:border-primary/20 hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${meta?.bg || 'bg-muted'}`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {operationLabels[item.operation]}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Processed in browser</p>
                        </div>
                      </div>
                      <time
                        dateTime={item.performedAt}
                        className="shrink-0 rounded-lg bg-background/80 px-2 py-1 font-mono text-[11px] font-medium text-muted-foreground shadow-xs"
                      >
                        {formatTimeAgo(item.performedAt)}
                      </time>
                    </motion.li>
                  );
                })}
              </ol>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
                <CheckCircle2 className="mb-2 size-8 text-muted-foreground/60" />
                <p className="text-sm font-medium">Ready for action</p>
                <p className="mt-1 max-w-xs text-xs">
                  Run any tool above to see live completed operations appear here in real-time.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Social Proof & Privacy Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 px-5 py-3.5 backdrop-blur-sm sm:flex-row"
        >
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
            <span>
              <strong className="text-foreground">0 bytes uploaded.</strong> All file data and operations run locally inside client browsers.
            </span>
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            Aggregate community metrics only
          </span>
        </motion.div>
      </div>
    </section>
  );
}
