'use client';

import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ImageExportFormat } from '@/lib/workers/types';

interface ExportControlsProps {
  format: ImageExportFormat;
  quality: number;
  fileName: string;
  isProcessing: boolean;
  onFormatChange: (format: ImageExportFormat) => void;
  onQualityChange: (quality: number) => void;
  onFileNameChange: (name: string) => void;
  onExport: () => void;
}

const FORMAT_OPTIONS: { id: ImageExportFormat; label: string; ext: string; desc: string }[] = [
  { id: 'image/png', label: 'PNG', ext: '.png', desc: 'Lossless quality, sharp details & transparency' },
  { id: 'image/jpeg', label: 'JPEG', ext: '.jpg', desc: 'Standard photographic format with compression' },
  { id: 'image/webp', label: 'WebP', ext: '.webp', desc: 'Modern web format, ~30% smaller file sizes' },
];

export default function ExportControls({
  format,
  quality,
  fileName,
  isProcessing,
  onFormatChange,
  onQualityChange,
  onFileNameChange,
  onExport,
}: ExportControlsProps) {
  const isLossy = format === 'image/jpeg' || format === 'image/webp';

  const getQualityBadge = (q: number) => {
    if (q >= 0.9) return { label: 'Maximum Quality', color: 'text-emerald-500' };
    if (q >= 0.75) return { label: 'High / Balanced', color: 'text-blue-500' };
    if (q >= 0.5) return { label: 'Medium / Compact', color: 'text-amber-500' };
    return { label: 'Smallest File Size', color: 'text-rose-500' };
  };

  const badge = getQualityBadge(quality);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Export Settings
        </span>
      </div>

      {/* Format Selection Grid */}
      <div className="grid gap-2">
        {FORMAT_OPTIONS.map((opt) => {
          const isSelected = format === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFormatChange(opt.id)}
              className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                  : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-9 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  {opt.label}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{opt.ext}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quality Slider for lossy formats */}
      {isLossy && (
        <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Compression Quality</span>
            <span className={`font-mono text-xs font-bold ${badge.color}`}>
              {Math.round(quality * 100)}% ({badge.label})
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none"
          />
        </div>
      )}

      {/* Filename Input */}
      <div className="space-y-1.5 rounded-2xl border border-border/60 bg-card/60 p-3.5">
        <label className="text-xs font-medium text-foreground">File Name</label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          placeholder="edited-image"
        />
      </div>

      {/* Primary Export Button */}
      <Button
        type="button"
        size="lg"
        onClick={onExport}
        disabled={isProcessing}
        className="w-full gap-2 rounded-2xl font-bold shadow-lg shadow-primary/20"
      >
        {isProcessing ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Rendering in Worker...
          </>
        ) : (
          <>
            <Download className="size-4" />
            Process & Download
          </>
        )}
      </Button>
    </div>
  );
}
