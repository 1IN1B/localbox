'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ImageCrop } from '@/lib/workers/types';

interface CropOverlayProps {
  imageWidth: number;
  imageHeight: number;
  displayedWidth: number;
  displayedHeight: number;
  aspectRatio: number | null; // null for freeform
  crop: ImageCrop;
  onChange: (crop: ImageCrop) => void;
}

type DragHandle =
  | 'move'
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | null;

export default function CropOverlay({
  imageWidth,
  imageHeight,
  displayedWidth,
  displayedHeight,
  aspectRatio,
  crop,
  onChange,
}: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialCrop: ImageCrop;
  } | null>(null);

  // Conversion scale between natural image pixels and displayed screen pixels
  const scaleX = displayedWidth / Math.max(1, imageWidth);
  const scaleY = displayedHeight / Math.max(1, imageHeight);

  // Screen coordinates of the crop rectangle
  const screenCrop = {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: Math.max(24, crop.width * scaleX),
    height: Math.max(24, crop.height * scaleY),
  };

  const handlePointerDown = (handle: DragHandle, e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveHandle(handle);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeHandle || !dragStartRef.current) return;

      const { startX, startY, initialCrop } = dragStartRef.current;
      const dx = (e.clientX - startX) / scaleX;
      const dy = (e.clientY - startY) / scaleY;

      let nextX = initialCrop.x;
      let nextY = initialCrop.y;
      let nextW = initialCrop.width;
      let nextH = initialCrop.height;

      const minW = 24 / scaleX;
      const minH = 24 / scaleY;

      if (activeHandle === 'move') {
        nextX = Math.max(0, Math.min(imageWidth - initialCrop.width, initialCrop.x + dx));
        nextY = Math.max(0, Math.min(imageHeight - initialCrop.height, initialCrop.y + dy));
      } else {
        // Resize according to handle
        if (activeHandle.includes('e')) {
          nextW = Math.max(minW, Math.min(imageWidth - initialCrop.x, initialCrop.width + dx));
        }
        if (activeHandle.includes('s')) {
          nextH = Math.max(minH, Math.min(imageHeight - initialCrop.y, initialCrop.height + dy));
        }
        if (activeHandle.includes('w')) {
          const clampedDx = Math.min(initialCrop.width - minW, Math.max(-initialCrop.x, dx));
          nextX = initialCrop.x + clampedDx;
          nextW = initialCrop.width - clampedDx;
        }
        if (activeHandle.includes('n')) {
          const clampedDy = Math.min(initialCrop.height - minH, Math.max(-initialCrop.y, dy));
          nextY = initialCrop.y + clampedDy;
          nextH = initialCrop.height - clampedDy;
        }

        // Apply aspect ratio constraints if locked
        if (aspectRatio) {
          if (activeHandle === 'e' || activeHandle === 'w' || activeHandle.includes('e')) {
            nextH = Math.max(minH, Math.min(imageHeight - nextY, nextW / aspectRatio));
            nextW = nextH * aspectRatio;
          } else {
            nextW = Math.max(minW, Math.min(imageWidth - nextX, nextH * aspectRatio));
            nextH = nextW / aspectRatio;
          }
        }
      }

      onChange({
        x: Math.round(Math.max(0, Math.min(imageWidth - nextW, nextX))),
        y: Math.round(Math.max(0, Math.min(imageHeight - nextH, nextY))),
        width: Math.round(Math.max(minW, Math.min(imageWidth, nextW))),
        height: Math.round(Math.max(minH, Math.min(imageHeight, nextH))),
      });
    },
    [activeHandle, aspectRatio, imageHeight, imageWidth, onChange, scaleX, scaleY]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setActiveHandle(null);
    dragStartRef.current = null;
  }, []);

  // Sync aspect ratio change automatically to existing crop
  useEffect(() => {
    if (!aspectRatio) return;
    const currentRatio = crop.width / crop.height;
    if (Math.abs(currentRatio - aspectRatio) > 0.01) {
      let targetW = crop.width;
      let targetH = Math.round(targetW / aspectRatio);
      if (targetH > imageHeight) {
        targetH = imageHeight;
        targetW = Math.round(targetH * aspectRatio);
      }
      if (targetW > imageWidth) {
        targetW = imageWidth;
        targetH = Math.round(targetW / aspectRatio);
      }
      const newX = Math.max(0, Math.min(imageWidth - targetW, crop.x));
      const newY = Math.max(0, Math.min(imageHeight - targetH, crop.y));
      onChange({ x: newX, y: newY, width: targetW, height: targetH });
    }
  }, [aspectRatio, crop.height, crop.width, crop.x, crop.y, imageHeight, imageWidth, onChange]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 select-none overflow-hidden touch-none"
      style={{ width: displayedWidth, height: displayedHeight }}
    >
      {/* Dimmed backdrop outside crop area using SVG path */}
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        width={displayedWidth}
        height={displayedHeight}
      >
        <path
          fill="rgba(0, 0, 0, 0.55)"
          fillRule="evenodd"
          d={`M0,0 H${displayedWidth} V${displayedHeight} H0 Z M${screenCrop.x},${screenCrop.y} v${screenCrop.height} h${screenCrop.width} v-${screenCrop.height} Z`}
        />
      </svg>

      {/* Active Crop Box */}
      <div
        style={{
          transform: `translate3d(${screenCrop.x}px, ${screenCrop.y}px, 0)`,
          width: screenCrop.width,
          height: screenCrop.height,
        }}
        className="absolute top-0 left-0 border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
      >
        {/* Draggable move body */}
        <div
          onPointerDown={(e) => handlePointerDown('move', e)}
          className="size-full cursor-move bg-transparent"
        >
          {/* Rule of thirds grid lines */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Real dimension badge */}
          <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[11px] font-medium text-white shadow-md backdrop-blur-xs">
            {crop.width} × {crop.height} px
          </div>
        </div>

        {/* Corner handles */}
        <div
          onPointerDown={(e) => handlePointerDown('nw', e)}
          className="absolute -top-2 -left-2 size-4.5 cursor-nwse-resize rounded-full border-2 border-white bg-primary shadow-md hover:scale-125"
        />
        <div
          onPointerDown={(e) => handlePointerDown('ne', e)}
          className="absolute -top-2 -right-2 size-4.5 cursor-nesw-resize rounded-full border-2 border-white bg-primary shadow-md hover:scale-125"
        />
        <div
          onPointerDown={(e) => handlePointerDown('sw', e)}
          className="absolute -bottom-2 -left-2 size-4.5 cursor-nesw-resize rounded-full border-2 border-white bg-primary shadow-md hover:scale-125"
        />
        <div
          onPointerDown={(e) => handlePointerDown('se', e)}
          className="absolute -bottom-2 -right-2 size-4.5 cursor-nwse-resize rounded-full border-2 border-white bg-primary shadow-md hover:scale-125"
        />

        {/* Edge midpoint bars */}
        <div
          onPointerDown={(e) => handlePointerDown('n', e)}
          className="absolute -top-1.5 left-1/2 h-2.5 w-7 -translate-x-1/2 cursor-ns-resize rounded-full bg-white/90 shadow-xs hover:bg-white"
        />
        <div
          onPointerDown={(e) => handlePointerDown('s', e)}
          className="absolute -bottom-1.5 left-1/2 h-2.5 w-7 -translate-x-1/2 cursor-ns-resize rounded-full bg-white/90 shadow-xs hover:bg-white"
        />
        <div
          onPointerDown={(e) => handlePointerDown('w', e)}
          className="absolute top-1/2 -left-1.5 h-7 w-2.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-white/90 shadow-xs hover:bg-white"
        />
        <div
          onPointerDown={(e) => handlePointerDown('e', e)}
          className="absolute top-1/2 -right-1.5 h-7 w-2.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-white/90 shadow-xs hover:bg-white"
        />
      </div>
    </div>
  );
}
