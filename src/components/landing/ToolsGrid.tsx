'use client';

import Link from 'next/link';
import {
  FileStack,
  Scissors,
  ImagePlus,
  FileText,
  AudioLines,
  ScissorsLineDashed,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const tools = [
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one document',
    icon: FileStack,
    href: '/tools/pdf/merge',
    gradient: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    name: 'Trim PDF',
    description: 'Extract a page range from a PDF',
    icon: Scissors,
    href: '/tools/pdf/split',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    name: 'Images to PDF',
    description: 'Turn JPG or PNG images into a PDF',
    icon: ImagePlus,
    href: '/tools/pdf/images',
    gradient: 'from-fuchsia-500 to-pink-600',
    shadowColor: 'shadow-fuchsia-500/20',
  },
  {
    name: 'Document to PDF',
    description: 'Convert DOCX, TXT, or Markdown to PDF',
    icon: FileText,
    href: '/tools/pdf/document',
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/20',
  },
  {
    name: 'Merge Audio',
    description: 'Join multiple audio files into one track',
    icon: AudioLines,
    href: '/tools/audio/merge',
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    name: 'Trim Audio',
    description: 'Cut a segment out of any audio file',
    icon: ScissorsLineDashed,
    href: '/tools/audio/trim',
    gradient: 'from-rose-500 to-red-600',
    shadowColor: 'shadow-rose-500/20',
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export function ToolsGrid() {
  return (
    <section id="tools" className="relative py-20 sm:py-28">
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
            Everything you need
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Six powerful tools, all running right in your browser.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {tools.map((tool) => (
            <motion.div key={tool.href} variants={item}>
              <Link
                href={tool.href}
                className={cn(
                  'group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300',
                  'hover:-translate-y-1 hover:border-transparent hover:shadow-xl',
                  tool.shadowColor,
                  'hover:shadow-lg'
                )}
              >
                {/* Icon tile */}
                <div
                  className={cn(
                    'mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                    tool.gradient,
                    tool.shadowColor
                  )}
                >
                  <tool.icon className="size-6" />
                </div>

                {/* Text */}
                <h3 className="mb-1.5 text-base font-semibold text-foreground">
                  {tool.name}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>

                {/* Arrow */}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  Open tool
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>

                {/* Hover glow border */}
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    'ring-1 ring-inset',
                    tool.gradient.replace('from-', 'ring-').replace(' to-', '/30 ')
                  )}
                  style={{ border: 'none', borderRadius: 'inherit' }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
