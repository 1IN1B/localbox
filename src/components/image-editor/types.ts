import type {
  ImageAdjustments,
  ImageFilter,
  ImageCrop,
} from '@/lib/workers/types';

export type EditorTab = 'crop' | 'adjust' | 'filter' | 'transform' | 'export';

export interface AspectRatioOption {
  label: string;
  value: number | null; // null for freeform
  iconName?: string;
}

export interface EditorSnapshot {
  crop: ImageCrop | null;
  rotate: number;
  flip: { horizontal: boolean; vertical: boolean };
  adjustments: ImageAdjustments;
  filter: ImageFilter;
  resize: { width: number; height: number };
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Freeform', value: null },
  { label: '1:1 Square', value: 1 },
  { label: '16:9 Cinema', value: 16 / 9 },
  { label: '9:16 Story', value: 9 / 16 },
  { label: '4:3 Standard', value: 4 / 3 },
  { label: '3:2 Classic', value: 3 / 2 },
];

export const FILTER_PRESETS: { id: ImageFilter; label: string; description: string }[] = [
  { id: 'none', label: 'Normal', description: 'Original image tones' },
  { id: 'grayscale', label: 'B & W', description: 'Classic monochrome' },
  { id: 'sepia', label: 'Sepia', description: 'Warm antique tone' },
  { id: 'vintage', label: 'Vintage', description: 'Faded film aesthetic' },
  { id: 'dramatic', label: 'Dramatic', description: 'Punchy contrast & depth' },
  { id: 'warm', label: 'Golden Hour', description: 'Soft sunset warmth' },
  { id: 'cool', label: 'Cool Breeze', description: 'Crisp blue atmospheric' },
  { id: 'invert', label: 'Invert', description: 'Negative color palette' },
  { id: 'sharpen', label: 'Sharpen', description: 'Enhanced micro-contrast' },
  { id: 'blur', label: 'Soft Blur', description: 'Dreamy soft focus' },
];

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
};
