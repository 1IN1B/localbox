'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function CtaBand() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to go local?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            All tools are free and run in your browser. No uploads, no accounts,
            no limits.
          </p>
          <div className="mt-8">
            <Link
              href="#tools"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-7 text-sm font-semibold text-indigo-700 shadow-xl shadow-indigo-900/20 transition-all hover:shadow-2xl hover:brightness-105 active:scale-[0.98]"
            >
              <Sparkles className="size-4" />
              Browse all tools
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
