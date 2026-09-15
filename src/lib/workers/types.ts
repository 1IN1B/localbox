export type PdfJob =
  | { type: 'merge'; files: { data: Uint8Array; name: string }[] }
  | { type: 'split'; file: Uint8Array; from: number; to: number }
  | { type: 'images-to-pdf'; images: { data: Uint8Array; name: string }[] }
  | {
      type: 'doc-to-pdf';
      file: Uint8Array;
      kind: 'docx' | 'txt' | 'md';
      html?: string;
      canvasImages?: { data: Uint8Array; width: number; height: number }[];
    };

export type AudioJob =
  | { type: 'merge'; files: { data: Uint8Array; name: string }[]; outputFormat: string }
  | { type: 'trim'; file: Uint8Array; start: number; end: number; outputFormat: string };

export type ImageAdjustments = {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100
};

export type ImageFilter =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'dramatic'
  | 'blur'
  | 'sharpen';

export type ImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export type ImageJob = {
  type: 'process-image';
  file: Uint8Array;
  crop?: ImageCrop;
  rotate?: number; // 0, 90, 180, 270
  flip?: { horizontal: boolean; vertical: boolean };
  resize?: { width: number; height: number };
  adjustments?: Partial<ImageAdjustments>;
  filter?: ImageFilter;
  export: {
    format: ImageExportFormat;
    quality?: number; // 0.1 to 1.0
    fileName: string;
  };
};

export type WorkerRequest = { id: number; job: PdfJob | AudioJob | ImageJob };
export type WorkerResponse =
  | { id: number; ok: true; data: Uint8Array; name: string }
  | { id: number; ok: true; html: string }
  | { id: number; ok: false; error: string };
export type WorkerProgress = { id: number; progress: number; message: string };

