'use client';

import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransformControlsProps {
  rotate: number;
  flip: { horizontal: boolean; vertical: boolean };
  resizeWidth: number;
  resizeHeight: number;
  originalWidth: number;
  originalHeight: number;
  lockAspect: boolean;
  onRotateChange: (rotate: number) => void;
  onFlipChange: (flip: { horizontal: boolean; vertical: boolean }) => void;
  onResizeChange: (width: number, height: number) => void;
  onLockAspectChange: (lock: boolean) => void;
  onResetTransforms: () => void;
}

export default function TransformControls({
  rotate,
  flip,
  resizeWidth,
  resizeHeight,
  originalWidth,
  originalHeight,
  lockAspect,
  onRotateChange,
  onFlipChange,
  onResizeChange,
  onLockAspectChange,
  onResetTransforms,
}: TransformControlsProps) {
  const aspect = originalWidth / Math.max(1, originalHeight);

  const handleRotateLeft = () => {
    onRotateChange((((rotate - 90) % 360) + 360) % 360);
  };

  const handleRotateRight = () => {
    onRotateChange((rotate + 90) % 360);
  };

  const handleToggleFlipH = () => {
    onFlipChange({ ...flip, horizontal: !flip.horizontal });
  };

  const handleToggleFlipV = () => {
    onFlipChange({ ...flip, vertical: !flip.vertical });
  };

  const handleWidthChange = (val: number) => {
    const w = Math.max(1, val);
    if (lockAspect) {
      const h = Math.round(w / aspect);
      onResizeChange(w, h);
    } else {
      onResizeChange(w, resizeHeight);
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, val);
    if (lockAspect) {
      const w = Math.round(h * aspect);
      onResizeChange(w, h);
    } else {
      onResizeChange(resizeWidth, h);
    }
  };

  const handleScalePercent = (percent: number) => {
    const w = Math.round((originalWidth * percent) / 100);
    const h = Math.round((originalHeight * percent) / 100);
    onResizeChange(w, h);
  };

  const isTransformed =
    rotate !== 0 ||
    flip.horizontal ||
    flip.vertical ||
    resizeWidth !== originalWidth ||
    resizeHeight !== originalHeight;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Rotate & Flip
        </span>
        {isTransformed && (
          <button
            type="button"
            onClick={onResetTransforms}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
          >
            <RefreshCw className="size-3" />
            Reset transforms
          </button>
        )}
      </div>

      {/* Rotation & Flip action buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRotateLeft}
          className="flex items-center gap-1.5 rounded-xl text-xs"
          title="Rotate 90° counter-clockwise"
        >
          <RotateCcw className="size-3.5" />
          -90°
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRotateRight}
          className="flex items-center gap-1.5 rounded-xl text-xs"
          title="Rotate 90° clockwise"
        >
          <RotateCw className="size-3.5" />
          +90°
        </Button>
        <Button
          type="button"
          variant={flip.horizontal ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleFlipH}
          className="flex items-center gap-1.5 rounded-xl text-xs"
          title="Flip horizontally"
        >
          <FlipHorizontal className="size-3.5" />
          Flip H
        </Button>
        <Button
          type="button"
          variant={flip.vertical ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleFlipV}
          className="flex items-center gap-1.5 rounded-xl text-xs"
          title="Flip vertically"
        >
          <FlipVertical className="size-3.5" />
          Flip V
        </Button>
      </div>

      {/* Resize Section */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Resize Dimensions</span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Original: {originalWidth} × {originalHeight}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase">Width (px)</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={resizeWidth}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => onLockAspectChange(!lockAspect)}
            className={`mt-4.5 flex size-8 items-center justify-center rounded-xl border transition-colors ${
              lockAspect
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
            title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
          >
            {lockAspect ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
          </button>

          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase">Height (px)</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={resizeHeight}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Scale Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">Scale:</span>
          {[100, 75, 50, 25].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleScalePercent(pct)}
              className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
