'use client';

import { ShieldCheck, Zap, UserX, Gift } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    title: 'Privacy first',
    description:
      'Files are processed in your browser and never uploaded to a server.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  },
  {
    title: 'Blazing fast',
    description:
      'Web Workers keep the UI responsive while heavy processing runs in the background.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
  },
  {
    title: 'No login required',
    description:
      'No accounts, no sign-ups. Just open the tool and go.',
    icon: UserX,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
  },
  {
    title: 'Free forever',
    description:
      'Every tool is free, with no limits or watermarks.',
    icon: Gift,
    color: 'text-fuchsia-500',
    bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-20 sm:py-28">
      {/* Subtle grid background */}
      <div className="bg-grid absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for you
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            No compromises. Everything runs locally, securely, and for free.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${feature.bg}`}
              >
                <feature.icon className={`size-5 ${feature.color}`} />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
