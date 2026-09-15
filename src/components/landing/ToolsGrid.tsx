'use client';

import Link from 'next/link';
import {
  FileStack,
  Scissors,
  ImagePlus,
  FileText,
  AudioLines,
  ScissorsLineDashed,
  Image as ImageIcon,
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
    category: 'PDF',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    name: 'Trim PDF',
    description: 'Extract a page range from a PDF',
    icon: Scissors,
    href: '/tools/pdf/split',
    gradient: 'from-violet-500 to-purple-600',
    category: 'PDF',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    name: 'Images to PDF',
    description: 'Turn JPG or PNG images into a PDF',
    icon: ImagePlus,
    href: '/tools/pdf/images',
    gradient: 'from-fuchsia-500 to-pink-600',
    category: 'PDF',
    shadowColor: 'shadow-fuchsia-500/20',
  },
  {
    name: 'Document to PDF',
    description: 'Convert DOCX, TXT, or Markdown to PDF',
    icon: FileText,
    href: '/tools/pdf/document',
    gradient: 'from-amber-500 to-orange-600',
    category: 'PDF',
    shadowColor: 'shadow-amber-500/20',
  },
  {
    name: 'Image Editor',
    description: 'Crop, adjust colors, apply filters & convert formats',
    icon: ImageIcon,
    href: '/tools/image/editor',
    gradient: 'from-sky-500 to-blue-600',
    category: 'Image',
    shadowColor: 'shadow-sky-500/20',
  },
  {
    name: 'Merge Audio',
    description: 'Join multiple audio files into one track',
    icon: AudioLines,
    href: '/tools/audio/merge',
    gradient: 'from-emerald-500 to-teal-600',
    category: 'Audio',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    name: 'Trim Audio',
    description: 'Cut a segment out of any audio file',
    icon: ScissorsLineDashed,
    href: '/tools/audio/trim',
    gradient: 'from-rose-500 to-red-600',
    category: 'Audio',
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
    <section id="tools" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:mb-16"
        >
          <p className="mb-3 text-sm font-semibold text-primary">Six purpose-built utilities</p>
          <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
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
                  'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition-all duration-300',
                  'hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl',
                  tool.shadowColor,
                  'hover:shadow-lg'
                )}
              >
                {/* Icon tile */}
                <div
                  className={cn(
                    'mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                    tool.gradient,
                    tool.shadowColor
                  )}
                >
                  <tool.icon className="size-6" />
                </div>

                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{tool.category}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
                  {tool.name}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>

                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  Open workspace
                </span>

                {/* Hover glow border */}
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
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
