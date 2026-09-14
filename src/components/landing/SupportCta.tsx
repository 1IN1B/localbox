'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function SupportCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-card"
        >
          {/* Glow accents */}
          <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-gradient-to-br from-rose-500/15 to-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 size-64 rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8 px-6 py-12 text-center sm:px-12 sm:py-16 lg:flex-row lg:justify-between lg:text-left">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-500">
                <Heart className="size-3.5" />
                Powered by a tiny community
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Love Localbox? Support us.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Free, private, and ad-free — forever. A small donation covers cost of
                infrastructure and helps make Localbox better in every possible way.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 lg:items-start">
              <Link
                href="/support"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-emerald-600 px-7 text-sm font-semibold text-white shadow-xl shadow-rose-500/20 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              >
                <Heart className="size-4" />
                Support the project
                <ArrowRight className="size-4" />
              </Link>
              <span className="text-xs text-muted-foreground">
                UPI, GitHub stars &amp; more — takes under a minute
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}