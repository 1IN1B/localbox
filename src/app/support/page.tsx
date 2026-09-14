'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  QrCode,
  Share2,
  Star,
  GitFork,
  Check,
  Link2,
  ArrowUpRight,
  ArrowLeft,
  HandCoins,
  CreditCard,
  Clock,
  Boxes,
} from 'lucide-react';
import { DonateModal } from '@/components/support/DonateModal';
import { supportConfig } from '@/lib/support/config';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export default function SupportPage() {
  const [donateOpen, setDonateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [shareUrl, setShareUrl] = useState<string>(supportConfig.github.repoUrl);

  useEffect(() => {
    setShareUrl(window.location.origin);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const shareText = encodeURIComponent(supportConfig.share.defaultText);
  const shareLink = encodeURIComponent(shareUrl);

  return (
    <div className="relative overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
        <nav className="relative mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          {/* Centered logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
                <Boxes className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-[-0.04em] text-foreground">
                Localbox
              </span>
            </Link>
          </div>

          {/* Back to home — top right */}
          <Link
            href="/"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/50 active:scale-[0.98]"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </nav>
      </div>

      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Header */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
        >
          <motion.div variants={item} className="mb-5 flex justify-center">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm sm:text-sm">
              <Heart className="size-3.5 text-rose-500 sm:size-4" />
              Support us &mdash; keep Localbox free forever
            </span>
          </motion.div>
          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl"
          >
            You make this possible
          </motion.h1>
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Localbox is free, open-source, and runs entirely in your browser &mdash; no
            servers, no tracking, no ads. If you love it, here are a few ways to support the
            project.
          </motion.p>
        </motion.div>

        {/* Community message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
        >
          <div className="glass-panel rounded-2xl border border-border/60 px-6 py-5 backdrop-blur-sm sm:px-8 sm:py-6">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              We don&apos;t have an office because we&apos;re not a company. Localbox is
              maintained by a very small community where a few people contribute their time
              without any pay. Your money will be used in giving a meaning to this project.
              You can call it your own and feel at home by supporting us. Your donations will
              cover the cost of infrastructure and make Localbox better in every possible way.
            </p>
          </div>
        </motion.div>

        {/* Support grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {/* 1 — Donate via UPI */}
          <motion.div variants={item}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <QrCode className="size-6" />
              </span>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                Donate via UPI
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Make a one-time donation using any UPI app &mdash; GPay, PhonePe, Paytm,
                or BHIM. Every contribution helps cover hosting and keep the tools free.
              </p>
              <button
                onClick={() => setDonateOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              >
                <HandCoins className="size-4" />
                Make a donation
              </button>
            </div>
          </motion.div>

          {/* 2 — Share the link */}
          <motion.div variants={item}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 blur-2xl opacity-60 transition-opacity group-hover:opacity-100" />
              <Share2 className="mb-5 size-6 text-blue-500" />
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                Share Localbox
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Know someone who edits PDFs or audio? Spread the word &mdash; the more
                people who use it, the more it grows.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="size-4" />
                      Copy link
                    </>
                  )}
                </button>
                <a
                  href={`https://wa.me/?text=${shareText}%20${shareLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${shareLink}&text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Telegram
                </a>
              </div>
            </div>
          </motion.div>

          {/* 3 — GitHub star */}
          <motion.div variants={item}>
            <a
              href={supportConfig.github.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl opacity-60 transition-opacity group-hover:opacity-100" />
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                <Star className="size-6" />
              </span>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                Star us on GitHub
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                A GitHub star is free, takes two seconds, and helps more people discover
                Localbox.
              </p>
              <span className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl border border-border/70 bg-background px-5 text-sm font-semibold text-foreground transition-all group-hover:-translate-y-0.5 group-hover:border-amber-500/40">
                Give us a star
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </motion.div>

          {/* 4 — Contribute */}
          <motion.div variants={item}>
            <a
              href={supportConfig.github.issuesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 blur-2xl opacity-60 transition-opacity group-hover:opacity-100" />
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
                <GitFork className="size-6" />
              </span>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                Contribute to the project
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Localbox is open source. Report a bug, suggest a feature, or submit a
                pull request on GitHub.
              </p>
              <span className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl border border-border/70 bg-background px-5 text-sm font-semibold text-foreground transition-all group-hover:-translate-y-0.5 group-hover:border-violet-500/40">
                Start contributing
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </motion.div>

          {/* 5 — Payment Gateway (coming soon) */}
          <motion.div variants={item}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-7 transition-all duration-300">
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-slate-400/15 to-slate-500/10 blur-2xl opacity-60" />
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-400/20">
                <CreditCard className="size-6" />
              </span>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                Payment Gateway
              </h2>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                Stripe, Razorpay, and international payment support &mdash; coming soon so
                anyone can support Localbox from anywhere in the world.
              </p>
              <span className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl border border-border/70 bg-background px-5 text-sm font-semibold text-foreground">
                <Clock className="size-4" />
                Coming soon
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center text-sm text-muted-foreground"
        >
          Prefer another way? Reach out on{' '}
          <Link
            href={supportConfig.github.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            GitHub
          </Link>
          .
        </motion.p>
      </div>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </div>
  );
}