'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="animated-gradient absolute inset-0 opacity-80" />

      {/* Grid overlay */}
      <div className="surface-grid absolute inset-0" />

      {/* Floating blurred blobs */}
      <div
        className="animate-float-blob absolute -top-32 -left-32 size-96 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/20 blur-3xl"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="animate-float-blob absolute -right-24 top-1/3 size-80 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/15 blur-3xl"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="animate-float-blob absolute -bottom-20 left-1/3 size-72 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/15 blur-3xl"
        style={{ animationDelay: '-14s' }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-36">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={item} className="mb-8 flex justify-center">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm sm:text-sm">
              <ShieldCheck className="size-3.5 text-emerald-500 sm:size-4" />
              100% client-side &middot; No uploads &middot; No login
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl lg:leading-[1.02]"
          >
            PDF &amp; audio tools that{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              never leave your device
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl"
          >
            Merge, trim, and convert PDFs and audio right in your browser.
            Powered by Web Workers &mdash; fast, private, and free.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="#tools"
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-violet-600 px-6 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/35 hover:brightness-110 active:scale-[0.98]"
            >
              <Sparkles className="size-4" />
              Explore tools
            </Link>
            <Link
              href="#how-it-works"
              className="glass-panel inline-flex h-12 items-center gap-2 rounded-2xl border border-border/70 px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-background"
            >
              How it works
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={item}
            className="mt-11 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm"
          >
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              No sign-up
            </span>
            <span className="hidden size-1 rounded-full bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Files stay local
            </span>
            <span className="hidden size-1 rounded-full bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Works offline after load
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
