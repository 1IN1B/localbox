'use client';

import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { ToolsGrid } from '@/components/landing/ToolsGrid';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CtaBand } from '@/components/landing/CtaBand';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <ToolsGrid />
        <Features />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
