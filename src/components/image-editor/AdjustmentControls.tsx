'use client';

import { RotateCcw, Sun, Contrast, Palette, Gauge, Thermometer } from 'lucide-react';
import type { ImageAdjustments } from '@/lib/workers/types';
import { DEFAULT_ADJUSTMENTS } from './types';

interface AdjustmentControlsProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: ImageAdjustments) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  icon: typeof Sun;
  onChange: (val: number) => void;
  onReset: () => void;
}

function SliderRow({
  label,
  value,
  min = -100,
  max = 100,
  step = 1,
  icon: Icon,
  onChange,
  onReset,
}: SliderRowProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-3.5 transition-colors hover:border-border">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Icon className="size-3.5 text-primary" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className={`w-8 text-right font-medium ${value !== 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
            {value > 0 ? `+${value}` : value}
          </span>
          {value !== 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="Reset slider"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none"
      />
    </div>
  );
}

export default function AdjustmentControls({
  adjustments,
  onChange,
}: AdjustmentControlsProps) {
  const isModified =
    adjustments.brightness !== 0 ||
    adjustments.contrast !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.exposure !== 0 ||
    adjustments.temperature !== 0;

  const handleUpdate = (field: keyof ImageAdjustments, val: number) => {
    onChange({ ...adjustments, [field]: val });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Color Adjustments
        </span>
        {isModified && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_ADJUSTMENTS })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
          >
            <RotateCcw className="size-3" />
            Reset all
          </button>
        )}
      </div>

      <div className="grid gap-2.5">
        <SliderRow
          label="Exposure"
          icon={Gauge}
          value={adjustments.exposure}
          onChange={(v) => handleUpdate('exposure', v)}
          onReset={() => handleUpdate('exposure', 0)}
        />
        <SliderRow
          label="Brightness"
          icon={Sun}
          value={adjustments.brightness}
          onChange={(v) => handleUpdate('brightness', v)}
          onReset={() => handleUpdate('brightness', 0)}
        />
        <SliderRow
          label="Contrast"
          icon={Contrast}
          value={adjustments.contrast}
          onChange={(v) => handleUpdate('contrast', v)}
          onReset={() => handleUpdate('contrast', 0)}
        />
        <SliderRow
          label="Saturation"
          icon={Palette}
          value={adjustments.saturation}
          onChange={(v) => handleUpdate('saturation', v)}
          onReset={() => handleUpdate('saturation', 0)}
        />
        <SliderRow
          label="Warmth / Temp"
          icon={Thermometer}
          value={adjustments.temperature}
          onChange={(v) => handleUpdate('temperature', v)}
          onReset={() => handleUpdate('temperature', 0)}
        />
      </div>
    </div>
  );
}
