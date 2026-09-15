'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Crop,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Minus,
  Plus,
  Redo2,
  RefreshCw,
  RotateCw,
  Sliders,
  Undo2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

import ToolHeader from '@/components/shared/ToolHeader';
import FileDropzone from '@/components/shared/FileDropzone';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { runImageJob } from '@/lib/workers/client';
import { trackOperation } from '@/lib/analytics/client';
import type {
  ImageCrop,
  ImageAdjustments,
  ImageFilter,
  ImageExportFormat,
} from '@/lib/workers/types';

import CropOverlay from '@/components/image-editor/CropOverlay';
import AdjustmentControls from '@/components/image-editor/AdjustmentControls';
import FilterControls from '@/components/image-editor/FilterControls';
import TransformControls from '@/components/image-editor/TransformControls';
import ExportControls from '@/components/image-editor/ExportControls';
import {
  ASPECT_RATIOS,
  DEFAULT_ADJUSTMENTS,
  type EditorSnapshot,
  type EditorTab,
} from '@/components/image-editor/types';

export default function ImageEditorPage() {
  // Source file and image preview
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // Editor states
  const [activeTab, setActiveTab] = useState<EditorTab>('crop');
  const [crop, setCrop] = useState<ImageCrop>({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedAspect, setSelectedAspect] = useState<number | null>(null);
  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [filter, setFilter] = useState<ImageFilter>('none');
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);

  // Export settings
  const [exportFormat, setExportFormat] = useState<ImageExportFormat>('image/png');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [exportFileName, setExportFileName] = useState('');

  // Processing & progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');

  // Canvas viewport display sizing
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);

  // History Stack (Undo/Redo)
  const [history, setHistory] = useState<EditorSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize and load an image file
  const handleFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    const arrayBuffer = await selectedFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const objectUrl = URL.createObjectURL(selectedFile);

    const img = new Image();
    img.onload = () => {
      setFile(selectedFile);
      setFileBytes(bytes);
      setImageSrc(objectUrl);
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);

      const initialCrop: ImageCrop = {
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      setCrop(initialCrop);
      setResizeWidth(img.naturalWidth);
      setResizeHeight(img.naturalHeight);
      setRotate(0);
      setFlip({ horizontal: false, vertical: false });
      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
      setFilter('none');
      setSelectedAspect(null);

      const baseName = selectedFile.name.replace(/\.[^.]+$/, '');
      setExportFileName(`${baseName}-edited`);

      // Initialize history
      const initialSnapshot: EditorSnapshot = {
        crop: initialCrop,
        rotate: 0,
        flip: { horizontal: false, vertical: false },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        filter: 'none',
        resize: { width: img.naturalWidth, height: img.naturalHeight },
      };
      setHistory([initialSnapshot]);
      setHistoryIndex(0);
    };
    img.src = objectUrl;
  }, []);

  // Compute displayed image bounding box inside the preview container
  const updateDisplaySize = useCallback(() => {
    if (!previewContainerRef.current || !naturalWidth || !naturalHeight) return;
    const container = previewContainerRef.current;
    const maxW = container.clientWidth - 48;
    const maxH = container.clientHeight - 48;

    const isRotated = rotate === 90 || rotate === 270;
    const activeW = isRotated ? naturalHeight : naturalWidth;
    const activeH = isRotated ? naturalWidth : naturalHeight;

    const scale = Math.min(maxW / activeW, maxH / activeH, 1) * zoom;
    setDisplaySize({
      width: Math.round(activeW * scale),
      height: Math.round(activeH * scale),
    });
  }, [naturalHeight, naturalWidth, rotate, zoom]);

  useEffect(() => {
    updateDisplaySize();
    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, [updateDisplaySize]);

  // Push snapshot to history
  const pushSnapshot = useCallback(() => {
    const currentSnapshot: EditorSnapshot = {
      crop,
      rotate,
      flip,
      adjustments,
      filter,
      resize: { width: resizeWidth, height: resizeHeight },
    };

    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, currentSnapshot];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [adjustments, crop, filter, flip, historyIndex, resizeHeight, resizeWidth, rotate]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const snap = history[prevIdx];
      if (snap) {
        if (snap.crop) setCrop(snap.crop);
        setRotate(snap.rotate);
        setFlip(snap.flip);
        setAdjustments(snap.adjustments);
        setFilter(snap.filter);
        setResizeWidth(snap.resize.width);
        setResizeHeight(snap.resize.height);
        setHistoryIndex(prevIdx);
      }
    }
  }, [history, historyIndex]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const snap = history[nextIdx];
      if (snap) {
        if (snap.crop) setCrop(snap.crop);
        setRotate(snap.rotate);
        setFlip(snap.flip);
        setAdjustments(snap.adjustments);
        setFilter(snap.filter);
        setResizeWidth(snap.resize.width);
        setResizeHeight(snap.resize.height);
        setHistoryIndex(nextIdx);
      }
    }
  }, [history, historyIndex]);

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRedo, handleUndo]);

  // Reset entire image to original
  const handleResetAll = () => {
    if (!naturalWidth || !naturalHeight) return;
    const initialCrop = { x: 0, y: 0, width: naturalWidth, height: naturalHeight };
    setCrop(initialCrop);
    setRotate(0);
    setFlip({ horizontal: false, vertical: false });
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setFilter('none');
    setResizeWidth(naturalWidth);
    setResizeHeight(naturalHeight);
    setSelectedAspect(null);
    pushSnapshot();
  };

  // Run Worker Export Pipeline
  const handleExport = async () => {
    if (!fileBytes) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      setProgressMsg('Starting worker...');

      const ext =
        exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
      const outputFileName = `${exportFileName || 'edited-image'}.${ext}`;

      const result = await runImageJob(
        {
          type: 'process-image',
          file: fileBytes,
          crop:
            crop.width !== naturalWidth || crop.height !== naturalHeight || crop.x !== 0 || crop.y !== 0
              ? crop
              : undefined,
          rotate: rotate !== 0 ? rotate : undefined,
          flip: flip.horizontal || flip.vertical ? flip : undefined,
          resize:
            resizeWidth !== naturalWidth || resizeHeight !== naturalHeight
              ? { width: resizeWidth, height: resizeHeight }
              : undefined,
          adjustments,
          filter,
          export: {
            format: exportFormat,
            quality: exportQuality,
            fileName: outputFileName,
          },
        },
        (p) => {
          setProgress(p.progress);
          setProgressMsg(p.message);
        }
      );

      if (result && result.data) {
        const blob = new Blob([result.data.buffer as ArrayBuffer], { type: exportFormat });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        void trackOperation('image-editor');
      }
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Construct CSS filters for instant 120 FPS hardware-accelerated preview
  const previewFilterStyle = useMemo(() => {
    const filters: string[] = [];
    if (adjustments.exposure !== 0) {
      filters.push(`brightness(${Math.pow(2, adjustments.exposure / 50)})`);
    }
    if (adjustments.brightness !== 0) {
      filters.push(`brightness(${1 + adjustments.brightness / 100})`);
    }
    if (adjustments.contrast !== 0) {
      filters.push(`contrast(${1 + adjustments.contrast / 100})`);
    }
    if (adjustments.saturation !== 0) {
      filters.push(`saturate(${1 + adjustments.saturation / 100})`);
    }
    if (adjustments.temperature !== 0) {
      // Warmth shift via sepia + hue-rotate
      if (adjustments.temperature > 0) {
        filters.push(`sepia(${adjustments.temperature * 0.3}%)`);
      } else {
        filters.push(`hue-rotate(${adjustments.temperature * 0.4}deg)`);
      }
    }

    // Preset filter preview styles
    if (filter === 'grayscale') filters.push('grayscale(100%)');
    if (filter === 'sepia') filters.push('sepia(100%)');
    if (filter === 'invert') filters.push('invert(100%)');
    if (filter === 'vintage') filters.push('sepia(50%) contrast(110%) brightness(105%)');
    if (filter === 'dramatic') filters.push('contrast(145%) saturate(120%)');
    if (filter === 'warm') filters.push('sepia(35%) saturate(125%)');
    if (filter === 'cool') filters.push('hue-rotate(20deg) saturate(110%)');
    if (filter === 'blur') filters.push('blur(2px)');
    if (filter === 'sharpen') filters.push('contrast(125%)');

    return filters.length > 0 ? filters.join(' ') : 'none';
  }, [adjustments, filter]);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:gap-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ToolHeader
          icon={ImageIcon}
          title="Image Editor"
          description="Crop, adjust colors, apply filters, and convert formats directly in your browser with zero uploads."
        />
      </motion.div>

      <ProcessingOverlay
        open={isProcessing}
        progress={progress}
        message={progressMsg || 'Processing image in Web Worker...'}
      />

      {/* Screen 1: Dropzone if no file selected */}
      {!file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto w-full max-w-2xl"
        >
          <FileDropzone
            accept="image/*"
            multiple={false}
            onFiles={handleFiles}
            label="Drop an image here or click to browse"
            hint="Supports JPG, PNG, WebP, SVG, AVIF, and GIF with zero server uploads"
          />
        </motion.div>
      )}

      {/* Screen 2: Interactive Editor Workspace */}
      {file && imageSrc && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-5"
        >
          {/* Top Global Action Bar */}
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 p-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="size-8 p-0"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="size-8 p-0"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="size-4" />
              </Button>
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetAll}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="size-3.5" />
                Reset All
              </Button>
            </div>

            {/* Image Dimensions & Name Pill */}
            <div className="hidden items-center gap-2 font-mono text-xs text-muted-foreground sm:flex">
              <span className="truncate max-w-[200px] font-medium text-foreground">{file.name}</span>
              <span>•</span>
              <span>
                {crop.width} × {crop.height} px
              </span>
              <span>•</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                className="gap-1.5 text-xs"
              >
                <FolderOpen className="size-3.5" />
                Open New
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setActiveTab('export')}
                className="gap-1.5 text-xs font-semibold"
              >
                <Download className="size-3.5" />
                Export
              </Button>
            </div>
          </div>

          {/* Main 2-Column Workspace Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Viewport Canvas Area */}
            <div
              ref={previewContainerRef}
              className="relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/70 bg-card/40 p-6 shadow-inner lg:col-span-8 lg:min-h-[640px]"
            >
              {/* Checkerboard background pattern for alpha transparency */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(#888 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Centered Preview Canvas wrapper */}
              <div
                className="relative flex items-center justify-center shadow-2xl transition-all duration-200"
                style={{
                  width: displaySize.width,
                  height: displaySize.height,
                }}
              >
                {/* Visual Image Element with Hardware Accelerated CSS Previews */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="size-full select-none object-contain pointer-events-none rounded-lg"
                  style={{
                    filter: previewFilterStyle,
                    transform: `rotate(${rotate}deg) scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`,
                    transition: 'transform 0.2s ease, filter 0.1s ease',
                  }}
                  draggable={false}
                />

                {/* Interactive Crop Overlay when in Crop Tab */}
                {activeTab === 'crop' && displaySize.width > 0 && (
                  <CropOverlay
                    imageWidth={naturalWidth}
                    imageHeight={naturalHeight}
                    displayedWidth={displaySize.width}
                    displayedHeight={displaySize.height}
                    aspectRatio={selectedAspect}
                    crop={crop}
                    onChange={(newCrop) => {
                      setCrop(newCrop);
                    }}
                  />
                )}
              </div>

              {/* Viewport Zoom Controls Floating Bar */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border/80 bg-background/90 px-3 py-1.5 shadow-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Zoom out"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-12 text-center font-mono text-xs font-semibold text-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Zoom in"
                >
                  <Plus className="size-3.5" />
                </button>
                <div className="h-4 w-px bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Reset to 100%"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Tabbed Controls Panel */}
            <div className="flex flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-sm lg:col-span-4">
              {/* Tabs Switcher Navigation */}
              <div className="mb-5 grid grid-cols-5 gap-1 rounded-2xl border border-border/70 bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('crop')}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
                    activeTab === 'crop'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Crop className="size-4" />
                  Crop
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
                    activeTab === 'adjust'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sliders className="size-4" />
                  Adjust
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('filter')}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
                    activeTab === 'filter'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="size-4" />
                  Filters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transform')}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
                    activeTab === 'transform'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <RotateCw className="size-4" />
                  Transform
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all ${
                    activeTab === 'export'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>

              {/* Active Tab Panel Content */}
              <div className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'crop' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Aspect Ratio Presets
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {ASPECT_RATIOS.map((opt) => {
                        const isSelected = selectedAspect === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setSelectedAspect(opt.value)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                : 'border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground'
                            }`}
                          >
                            <span className="text-xs">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Interactive Crop</p>
                      Drag the corner handles or bounding box on the preview canvas to adjust your crop region.
                    </div>
                  </div>
                )}

                {activeTab === 'adjust' && (
                  <AdjustmentControls
                    adjustments={adjustments}
                    onChange={(adj) => {
                      setAdjustments(adj);
                      pushSnapshot();
                    }}
                  />
                )}

                {activeTab === 'filter' && (
                  <FilterControls
                    filter={filter}
                    onChange={(f) => {
                      setFilter(f);
                      pushSnapshot();
                    }}
                  />
                )}

                {activeTab === 'transform' && (
                  <TransformControls
                    rotate={rotate}
                    flip={flip}
                    resizeWidth={resizeWidth}
                    resizeHeight={resizeHeight}
                    originalWidth={naturalWidth}
                    originalHeight={naturalHeight}
                    lockAspect={lockAspect}
                    onRotateChange={(r) => {
                      setRotate(r);
                      pushSnapshot();
                    }}
                    onFlipChange={(f) => {
                      setFlip(f);
                      pushSnapshot();
                    }}
                    onResizeChange={(w, h) => {
                      setResizeWidth(w);
                      setResizeHeight(h);
                      pushSnapshot();
                    }}
                    onLockAspectChange={setLockAspect}
                    onResetTransforms={() => {
                      setRotate(0);
                      setFlip({ horizontal: false, vertical: false });
                      setResizeWidth(naturalWidth);
                      setResizeHeight(naturalHeight);
                      pushSnapshot();
                    }}
                  />
                )}

                {activeTab === 'export' && (
                  <ExportControls
                    format={exportFormat}
                    quality={exportQuality}
                    fileName={exportFileName}
                    isProcessing={isProcessing}
                    onFormatChange={setExportFormat}
                    onQualityChange={setExportQuality}
                    onFileNameChange={setExportFileName}
                    onExport={handleExport}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
