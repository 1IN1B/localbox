'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileStack,
  Scissors,
  ImagePlus,
  FileText,
  AudioLines,
  ScissorsLineDashed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';

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

type FloatingIconConfig = {
  icon: LucideIcon;
  position: string;
  gradient: string;
  shadow: string;
  depth: number;
  duration: number;
  delay: number;
  tilt: number; // base rotation in degrees (positive = clockwise / right)
  scale: number; // icon scale (1 = normal)
};

// Same icons as the tools grid, suspended around the hero text.
// Placement + orientation per spec:
//   top row    — above the headline, slightly off-center, tilting toward the middle
//   flanks     — far left/right of the headline, tilting toward the middle
//   bottom row — flanking the CTA buttons, tilting outward
// Positions are relative to the max-w-4xl text container (the icons live inside it).
// Negative offsets place icons just outside the text edges.
const floatingIcons: FloatingIconConfig[] = [
  // Top row — above the headline, slightly off-center, tilting toward the middle (1.1×)
  { icon: FileStack, position: 'left-[28%] top-[-8%]', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25', depth: 0.5, duration: 5, delay: 0, tilt: 8, scale: 1.1 },
  { icon: Scissors, position: 'right-[28%] top-[-8%]', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25', depth: 0.8, duration: 6, delay: 1.2, tilt: -8, scale: 1.1 },
  // Flanking the headline — just outside the text edges, tilting toward the middle (1.2×)
  { icon: ImagePlus, position: 'left-[-6%] top-[42%]', gradient: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/25', depth: 0.35, duration: 5.5, delay: 2.1, tilt: 8, scale: 1.2 },
  { icon: FileText, position: 'right-[-6%] top-[42%]', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25', depth: 0.65, duration: 4.5, delay: 0.6, tilt: -8, scale: 1.2 },
  // Bottom row — flanking the CTA buttons, tilting outward (1.1×)
  { icon: AudioLines, position: 'left-[10%] top-[72%]', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25', depth: 0.9, duration: 6.5, delay: 1.8, tilt: -8, scale: 1.1 },
  { icon: ScissorsLineDashed, position: 'right-[10%] top-[72%]', gradient: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/25', depth: 0.4, duration: 5, delay: 2.6, tilt: 8, scale: 1.1 },
];

function FloatingIcon({
  icon: Icon,
  position,
  gradient,
  shadow,
  depth,
  duration,
  delay,
  tilt,
  scale,
  mouseX,
  mouseY,
}: FloatingIconConfig & { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  // Subtle parallax: each icon drifts a little with the cursor, scaled by depth.
  const x = useTransform(mouseX, (v) => v * depth * 44);
  const y = useTransform(mouseY, (v) => v * depth * 44);

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: delay * 0.5 + 0.4, ease: 'easeOut' }}
      className={cn('pointer-events-none absolute hidden lg:block', position)}
    >
      {/* Gentle bobbing + wobble around the base tilt so the icon feels suspended */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [tilt - 3, tilt + 3, tilt - 3] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        style={{ scale }}
        className={cn(
          'flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl ring-1 ring-white/20 lg:size-12',
          gradient,
          shadow
        )}
      >
        <Icon className="size-5 lg:size-6" />
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden"
    >
      <div className="hero-gradient absolute inset-0 opacity-80" />

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
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-36">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-4xl text-center"
        >
          {/* Floating tool icons — positioned relative to this text container */}
          {floatingIcons.map((cfg) => (
            <FloatingIcon key={cfg.position} {...cfg} mouseX={springX} mouseY={springY} />
          ))}


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