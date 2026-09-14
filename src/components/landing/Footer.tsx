'use client';

import Link from 'next/link';
import { Boxes } from 'lucide-react';

const toolLinks = [
  { href: '/tools/pdf/merge', label: 'Merge PDF' },
  { href: '/tools/pdf/split', label: 'Trim PDF' },
  { href: '/tools/pdf/images', label: 'Images to PDF' },
  { href: '/tools/pdf/document', label: 'Document to PDF' },
  { href: '/tools/audio/merge', label: 'Merge Audio' },
  { href: '/tools/audio/trim', label: 'Trim Audio' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
                <Boxes className="size-4" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                Localbox
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Built with Next.js. Runs 100% in your browser.
            </p>
          </div>

          {/* Tools column */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Tools
            </h4>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product column */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Support us
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/1IN1B/localbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal column */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Legal & Privacy
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Localbox. Open source &amp; free forever.
          </p>
          <p className="text-xs text-muted-foreground">
            PDF &amp; audio tools that never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
}
