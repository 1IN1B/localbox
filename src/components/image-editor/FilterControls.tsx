'use client';

import { Check } from 'lucide-react';
import type { ImageFilter } from '@/lib/workers/types';
import { FILTER_PRESETS } from './types';

interface FilterControlsProps {
  filter: ImageFilter;
  onChange: (filter: ImageFilter) => void;
}

const FILTER_SWATCHES: Record<ImageFilter, string> = {
  none: 'from-zinc-400 to-zinc-600',
  grayscale: 'from-zinc-300 to-zinc-700 saturate-0',
  sepia: 'from-amber-600/70 to-yellow-800/80',
  vintage: 'from-rose-400/80 via-amber-300/80 to-teal-500/80',
  dramatic: 'from-indigo-600 via-purple-700 to-zinc-950',
  warm: 'from-amber-400 to-orange-600',
  cool: 'from-cyan-400 to-blue-600',
  invert: 'from-white to-black invert',
  sharpen: 'from-emerald-400 to-teal-600',
  blur: 'from-sky-400/50 to-indigo-500/50 blur-[1px]',
};

export default function FilterControls({
  filter,
  onChange,
}: FilterControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Creative Filters
        </span>
        {filter !== 'none' && (
          <button
            type="button"
            onClick={() => onChange('none')}
            className="text-xs font-semibold text-primary transition-opacity hover:opacity-80"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
        {FILTER_PRESETS.map((preset) => {
          const isSelected = filter === preset.id;
          const swatchGradient = FILTER_SWATCHES[preset.id];

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`group relative flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                  : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
              }`}
            >
              {/* Color swatch thumbnail */}
              <div
                className={`relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-br shadow-xs ${swatchGradient}`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  {preset.label}
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {preset.label}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
