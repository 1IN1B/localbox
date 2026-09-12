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

export type WorkerRequest = { id: number; job: PdfJob | AudioJob };
export type WorkerResponse =
  | { id: number; ok: true; data: Uint8Array; name: string }
  | { id: number; ok: true; html: string }
  | { id: number; ok: false; error: string };
export type WorkerProgress = { id: number; progress: number; message: string };
