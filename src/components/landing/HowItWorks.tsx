'use client';

import { MousePointerClick, UploadCloud, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: 1,
    title: 'Choose a tool',
    description: 'Pick from our collection of PDF and audio utilities.',
    icon: MousePointerClick,
  },
  {
    number: 2,
    title: 'Drop your files',
    description: 'Drag and drop or click to select files from your device.',
    icon: UploadCloud,
  },
  {
    number: 3,
    title: 'Download the result',
    description: 'Get your processed files instantly — nothing leaves your browser.',
    icon: Download,
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Three simple steps — no setup required.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
        >
          {/* Connecting line (desktop only) */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px md:block">
            <div className="mx-auto h-full w-full max-w-2xl bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={item}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number circle */}
              <div className="relative z-10 mb-6">
                <div
                  className={cn(
                    'flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-lg',
                    'transition-transform duration-300 hover:scale-105'
                  )}
                >
                  <step.icon className="size-7 text-muted-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md">
                  {step.number}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
