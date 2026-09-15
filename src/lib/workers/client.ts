import type { PdfJob, AudioJob, ImageJob, WorkerResponse, WorkerProgress } from './types';

type ProgressCallback = (p: WorkerProgress) => void;

interface WorkerState {
  worker: Worker | null;
  idleTimer: ReturnType<typeof setTimeout> | null;
  jobId: number;
}

const IDLE_TIMEOUT_MS = 60_000;
const pendingPdf = new Map<number, { resolve: (v: { data: Uint8Array; name: string }) => void; reject: (e: Error) => void }>();
const pendingAudio = new Map<number, { resolve: (v: { data: Uint8Array; name: string }) => void; reject: (e: Error) => void }>();
const pendingImage = new Map<number, { resolve: (v: { data: Uint8Array; name: string }) => void; reject: (e: Error) => void }>();
const pendingHtmlPdf = new Map<number, { resolve: (v: { html: string }) => void; reject: (e: Error) => void }>();

const pdfState: WorkerState = { worker: null, idleTimer: null, jobId: 0 };
const audioState: WorkerState = { worker: null, idleTimer: null, jobId: 0 };
const imageState: WorkerState = { worker: null, idleTimer: null, jobId: 0 };

function resetIdleTimer(state: WorkerState) {
  if (state.idleTimer) clearTimeout(state.idleTimer);
  state.idleTimer = setTimeout(() => {
    if (state.worker) {
      state.worker.terminate();
      state.worker = null;
    }
  }, IDLE_TIMEOUT_MS);
}

function cancelIdleTimer(state: WorkerState) {
  if (state.idleTimer) {
    clearTimeout(state.idleTimer);
    state.idleTimer = null;
  }
}

function isProgressMessage(msg: unknown): msg is WorkerProgress {
  return typeof msg === 'object' && msg !== null && 'progress' in msg && 'message' in msg && !('ok' in msg);
}

function createPdfWorker(): Worker {
  const w = new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (e: MessageEvent<WorkerResponse | WorkerProgress>) => {
    const msg = e.data;

    if (isProgressMessage(msg)) {
      return;
    }

    const response = msg as WorkerResponse;
    const pending = pendingPdf.get(response.id);
    const pendingHtml = pendingHtmlPdf.get(response.id);

    if (pending) {
      pendingPdf.delete(response.id);
      if (response.ok && 'data' in response) {
        pending.resolve({ data: new Uint8Array(response.data), name: response.name });
      } else if (response.ok && 'html' in response) {
        pending.reject(new Error('Unexpected HTML response'));
      } else if (!response.ok) {
        pending.reject(new Error(response.error));
      }
    }

    if (pendingHtml) {
      if (response.ok && 'html' in response) {
        pendingHtmlPdf.delete(response.id);
        pendingHtml.resolve({ html: response.html });
      } else if (!response.ok) {
        pendingHtmlPdf.delete(response.id);
        pendingHtml.reject(new Error(response.error));
      }
    }
  };
  w.onerror = (e) => {
    console.error('[PDF Worker] Error:', e);
  };
  return w;
}

function createAudioWorker(): Worker {
  const w = new Worker(new URL('./audio.worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (e: MessageEvent<WorkerResponse | WorkerProgress>) => {
    const msg = e.data;

    if (isProgressMessage(msg)) {
      return;
    }

    const response = msg as WorkerResponse;
    const pending = pendingAudio.get(response.id);
    if (pending) {
      pendingAudio.delete(response.id);
      if (response.ok && 'data' in response) {
        pending.resolve({ data: new Uint8Array(response.data), name: response.name });
      } else if (!response.ok) {
        pending.reject(new Error(response.error));
      }
    }
  };
  w.onerror = (e) => {
    console.error('[Audio Worker] Error:', e);
  };
  return w;
}

function createImageWorker(): Worker {
  const w = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (e: MessageEvent<WorkerResponse | WorkerProgress>) => {
    const msg = e.data;

    if (isProgressMessage(msg)) {
      return;
    }

    const response = msg as WorkerResponse;
    const pending = pendingImage.get(response.id);
    if (pending) {
      pendingImage.delete(response.id);
      if (response.ok && 'data' in response) {
        pending.resolve({ data: new Uint8Array(response.data), name: response.name });
      } else if (!response.ok) {
        pending.reject(new Error(response.error));
      }
    }
  };
  w.onerror = (e) => {
    console.error('[Image Worker] Error:', e);
  };
  return w;
}

function ensurePdfWorker(state: WorkerState, onProgress?: ProgressCallback): Worker {
  cancelIdleTimer(state);

  if (!state.worker) {
    state.worker = createPdfWorker();
  }

  // Always set the latest progress callback via a wrapper
  const w = state.worker;
  w.onmessage = (e: MessageEvent<WorkerResponse | WorkerProgress>) => {
    const msg = e.data;
    if (isProgressMessage(msg)) {
      onProgress?.(msg);
      return;
    }

    const response = msg as WorkerResponse;
    const pending = pendingPdf.get(response.id);
    const pendingHtml = pendingHtmlPdf.get(response.id);

    if (pending) {
      pendingPdf.delete(response.id);
      if (response.ok && 'data' in response) {
        pending.resolve({ data: new Uint8Array(response.data), name: response.name });
      } else if (response.ok && 'html' in response) {
        pending.reject(new Error('Unexpected HTML response'));
      } else if (!response.ok) {
        pending.reject(new Error(response.error));
      }
    }

    if (pendingHtml) {
      if (response.ok && 'html' in response) {
        pendingHtmlPdf.delete(response.id);
        pendingHtml.resolve({ html: response.html });
      } else if (!response.ok) {
        pendingHtmlPdf.delete(response.id);
        pendingHtml.reject(new Error(response.error));
      }
    }
  };

  resetIdleTimer(state);
  return state.worker;
}

function ensureAudioWorker(state: WorkerState, onProgress?: ProgressCallback): Worker {
  cancelIdleTimer(state);

  if (!state.worker) {
    state.worker = createAudioWorker();
  }

  const w = state.worker;
  w.onmessage = (e: MessageEvent<WorkerResponse | WorkerProgress>) => {
    const msg = e.data;
    if (isProgressMessage(msg)) {
      onProgress?.(msg);
      return;
    }

    const response = msg as WorkerResponse;
    const pending = pendingAudio.get(response.id);
    if (pending) {
      pendingAudio.delete(response.id);
      if (response.ok && 'data' in response) {
        pending.resolve({ data: new Uint8Array(response.data), name: response.name });
      } else if (!response.ok) {
        pending.reject(new Error(response.error));
      }
    }
  };

  resetIdleTimer(state);
  return state.worker;
}

function ensureImageWorker(state: WorkerState, onProgress?: ProgressCallback): Worker {
  cancelIdleTimer(state);

  if (!state.worker) {
    state.worker = createImageWorker();
  }

  const w = state.worker;
  w.onmessage = (e: MessageEvent<WorkerResponse | WorkerProgress>) => {
    const msg = e.data;
    if (isProgressMessage(msg)) {
      onProgress?.(msg);
      return;
    }

    const response = msg as WorkerResponse;
    const pending = pendingImage.get(response.id);
    if (pending) {
      pendingImage.delete(response.id);
      if (response.ok && 'data' in response) {
        pending.resolve({ data: new Uint8Array(response.data), name: response.name });
      } else if (!response.ok) {
        pending.reject(new Error(response.error));
      }
    }
  };

  resetIdleTimer(state);
  return state.worker;
}

/**
 * Run a PDF job in the PDF worker.
 * Returns the result data or HTML (for docx intermediate step).
 */
export async function runPdfJob(
  job: PdfJob,
  onProgress?: ProgressCallback
): Promise<{ data: Uint8Array; name: string } | { html: string }> {
  const id = ++pdfState.jobId;
  const worker = ensurePdfWorker(pdfState, onProgress);

  return new Promise<{ data: Uint8Array; name: string } | { html: string }>((resolve, reject) => {
    // Only the DOCX intermediate step (no canvas yet) returns HTML.
    // txt/md return data directly and must route to the data pending map.
    if (job.type === 'doc-to-pdf' && job.kind === 'docx' && !job.canvasImages) {
      pendingHtmlPdf.set(id, { resolve, reject });
    } else {
      pendingPdf.set(id, { resolve, reject });
    }

    worker.postMessage({ id, job }, { transfer: getTransferables(job) });
  });
}

/**
 * Run an audio job in the audio worker.
 */
export async function runAudioJob(
  job: AudioJob,
  onProgress?: ProgressCallback
): Promise<{ data: Uint8Array; name: string }> {
  const id = ++audioState.jobId;
  const worker = ensureAudioWorker(audioState, onProgress);

  return new Promise<{ data: Uint8Array; name: string }>((resolve, reject) => {
    pendingAudio.set(id, { resolve, reject });
    worker.postMessage({ id, job }, { transfer: getTransferables(job) });
  });
}

/**
 * Run an image job in the image worker.
 */
export async function runImageJob(
  job: ImageJob,
  onProgress?: ProgressCallback
): Promise<{ data: Uint8Array; name: string }> {
  const id = ++imageState.jobId;
  const worker = ensureImageWorker(imageState, onProgress);

  return new Promise<{ data: Uint8Array; name: string }>((resolve, reject) => {
    pendingImage.set(id, { resolve, reject });
    worker.postMessage({ id, job }, { transfer: getTransferables(job) });
  });
}

/**
 * Extract transferable ArrayBuffers from a job for zero-copy postMessage.
 */
function getTransferables(job: PdfJob | AudioJob | ImageJob): ArrayBuffer[] {
  const transferables: ArrayBuffer[] = [];
  const seen = new Set<ArrayBuffer>();

  const push = (buf: ArrayBuffer) => {
    // Dedupe: postMessage rejects duplicate transferables (e.g. same file selected twice)
    if (!seen.has(buf)) {
      seen.add(buf);
      transferables.push(buf);
    }
  };

  if ('files' in job) {
    for (const f of job.files) {
      push(f.data.buffer as ArrayBuffer);
    }
  }
  if ('file' in job && job.type !== 'process-image') {
    // Copy before transfer: the caller may reuse the same buffer for a
    // second job (e.g. DOCX two-step flow), and transfer detaches it.
    const buf = (job as { file: Uint8Array }).file.buffer as ArrayBuffer;
    push(buf.slice(0));
  }
  if (job.type === 'process-image') {
    // Clone before transfer so caller keeps original buffer in memory
    const buf = job.file.buffer as ArrayBuffer;
    const copy = buf.slice(0);
    job.file = new Uint8Array(copy);
    push(copy);
  }
  if ('images' in job) {
    for (const img of (job as { images: { data: Uint8Array }[] }).images) {
      push(img.data.buffer as ArrayBuffer);
    }
  }
  if ('canvasImages' in job && job.canvasImages) {
    for (const ci of (job as { canvasImages: { data: Uint8Array }[] }).canvasImages) {
      push(ci.data.buffer as ArrayBuffer);
    }
  }

  return transferables;
}
