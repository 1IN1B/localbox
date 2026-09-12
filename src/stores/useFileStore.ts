import { create } from 'zustand';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  blob: Blob;
  type: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

interface FileState {
  files: FileItem[];
  isProcessing: boolean;
  progress: number;
  status: ProcessingStatus;
  error: string | null;
  result: { blob: Blob; name: string } | null;

  // File actions
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  reorder: (from: number, to: number) => void;
  clear: () => void;

  // Processing actions
  setProcessing: () => void;
  setProgress: (progress: number) => void;
  setDone: (blob: Blob, name: string) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

let idCounter = 0;
function generateId(): string {
  return `file_${Date.now()}_${++idCounter}`;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  isProcessing: false,
  progress: 0,
  status: 'idle',
  error: null,
  result: null,

  addFiles: (files: File[]) => {
    set((state) => ({
      files: [
        ...state.files,
        ...files.map((f) => ({
          id: generateId(),
          name: f.name,
          size: f.size,
          blob: f,
          type: f.type,
        })),
      ],
    }));
  },

  removeFile: (id: string) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }));
  },

  reorder: (from: number, to: number) => {
    set((state) => {
      const newFiles = [...state.files];
      const [moved] = newFiles.splice(from, 1);
      newFiles.splice(to, 0, moved);
      return { files: newFiles };
    });
  },

  clear: () => {
    set({ files: [], result: null, error: null, status: 'idle', progress: 0 });
  },

  setProcessing: () => {
    set({ isProcessing: true, status: 'processing', progress: 0, error: null, result: null });
  },

  setProgress: (progress: number) => {
    set({ progress });
  },

  setDone: (blob: Blob, name: string) => {
    set({ isProcessing: false, status: 'done', progress: 1, result: { blob, name } });
  },

  setError: (msg: string) => {
    set({ isProcessing: false, status: 'error', error: msg });
  },

  reset: () => {
    set({
      isProcessing: false,
      progress: 0,
      status: 'idle',
      error: null,
      result: null,
    });
  },
}));
