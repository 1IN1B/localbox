/* eslint-disable no-restricted-globals */
import { FFmpeg } from '@ffmpeg/ffmpeg';

import type { AudioJob, WorkerResponse, WorkerProgress } from './types';

type ResponseMessage = WorkerResponse;
type ProgressMessage = WorkerProgress;

// Module-level FFmpeg instance — reused across jobs
const ffmpeg = new FFmpeg();
let loaded = false;

function post(response: ResponseMessage) {
  self.postMessage(response);
}

function postProgress(progress: ProgressMessage) {
  self.postMessage(progress);
}

async function ensureLoaded(): Promise<void> {
  if (loaded && ffmpeg.loaded) return;

  postProgress({ id: -1, progress: 0, message: 'Loading ffmpeg core...' });

  ffmpeg.on('progress', ({ progress: p, time: _time }) => {
    // Forward progress from ffmpeg to main thread
    // The id will be patched by the caller
    self.postMessage({ id: -1, progress: Math.min(p, 1), message: 'Processing audio...' } satisfies ProgressMessage);
  });

  await ffmpeg.load({
    coreURL: '/ffmpeg/ffmpeg-core.js',
    wasmURL: '/ffmpeg/ffmpeg-core.wasm',
    workerURL: '/ffmpeg/ffmpeg-core.worker.js',
  });

  loaded = true;
}

function getCodecForFormat(format: string): string {
  switch (format.toLowerCase()) {
    case 'mp3':
      return 'libmp3lame';
    case 'wav':
      return 'pcm_s16le';
    case 'm4a':
    case 'aac':
      return 'aac';
    case 'ogg':
      return 'libvorbis';
    default:
      return 'libmp3lame';
  }
}

function getExtensionForFormat(format: string): string {
  switch (format.toLowerCase()) {
    case 'mp3':
      return 'mp3';
    case 'wav':
      return 'wav';
    case 'm4a':
    case 'aac':
      return 'm4a';
    case 'ogg':
      return 'ogg';
    default:
      return 'mp3';
  }
}

// --- Job Handlers ---

async function handleMerge(
  files: { data: Uint8Array; name: string }[],
  outputFormat: string
): Promise<WorkerResponse> {
  await ensureLoaded();

  postProgress({ id: -1, progress: 0.1, message: 'Writing input files...' });

  // Write each file to ffmpeg's virtual filesystem with unique names
  const inputNames: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const ext = files[i].name.split('.').pop() || 'audio';
    const inputName = `input_${i}.${ext}`;
    await ffmpeg.writeFile(inputName, files[i].data);
    inputNames.push(inputName);
  }

  // Build concat filter for arbitrary number of inputs
  const codec = getCodecForFormat(outputFormat);
  const ext = getExtensionForFormat(outputFormat);
  const outputName = `output.${ext}`;

  postProgress({ id: -1, progress: 0.3, message: 'Merging audio files...' });

  if (files.length === 1) {
    // Single file — just transcode
    await ffmpeg.exec(['-i', inputNames[0], '-c:a', codec, outputName]);
  } else {
    // Use concat filter
    const filterInputs = inputNames.map((name, i) => `[${i}:a]`).join('');
    const filterComplex = `${filterInputs}concat=n=${files.length}:v=0:a=1[a]`;

    const args: string[] = [];
    for (const name of inputNames) {
      args.push('-i', name);
    }
    args.push('-filter_complex', filterComplex, '-map', '[a]', '-c:a', codec, outputName);

    await ffmpeg.exec(args);
  }

  postProgress({ id: -1, progress: 0.8, message: 'Reading output file...' });
  const outputData = await ffmpeg.readFile(outputName);

  // Clean up virtual FS files
  for (const name of inputNames) {
    await ffmpeg.deleteFile(name).catch(() => {});
  }
  await ffmpeg.deleteFile(outputName).catch(() => {});

  if (typeof outputData === 'string') {
    return { id: -1, ok: false, error: 'Failed to read output file' };
  }

  postProgress({ id: -1, progress: 1, message: 'Done!' });
  const resultName = `merged.${ext}`;
  return { id: -1, ok: true, data: new Uint8Array(outputData), name: resultName };
}

async function handleTrim(
  file: Uint8Array,
  start: number,
  end: number,
  outputFormat: string
): Promise<WorkerResponse> {
  await ensureLoaded();

  postProgress({ id: -1, progress: 0.1, message: 'Writing input file...' });
  await ffmpeg.writeFile('input_audio', file);

  const codec = getCodecForFormat(outputFormat);
  const ext = getExtensionForFormat(outputFormat);
  const outputName = `trimmed.${ext}`;

  postProgress({ id: -1, progress: 0.3, message: 'Trimming audio...' });

  await ffmpeg.exec([
    '-ss', String(start),
    '-to', String(end),
    '-i', 'input_audio',
    '-c:a', codec,
    outputName,
  ]);

  postProgress({ id: -1, progress: 0.8, message: 'Reading output file...' });
  const outputData = await ffmpeg.readFile(outputName);

  // Clean up
  await ffmpeg.deleteFile('input_audio').catch(() => {});
  await ffmpeg.deleteFile(outputName).catch(() => {});

  if (typeof outputData === 'string') {
    return { id: -1, ok: false, error: 'Failed to read output file' };
  }

  postProgress({ id: -1, progress: 1, message: 'Done!' });
  const resultName = `trimmed.${ext}`;
  return { id: -1, ok: true, data: new Uint8Array(outputData), name: resultName };
}

// --- Main Message Handler ---

self.onmessage = async (e: MessageEvent<{ id: number; job: AudioJob }>) => {
  const { id, job } = e.data;

  try {
    let response: ResponseMessage;

    switch (job.type) {
      case 'merge':
        response = await handleMerge(job.files, job.outputFormat);
        break;
      case 'trim':
        response = await handleTrim(job.file, job.start, job.end, job.outputFormat);
        break;
      default:
        response = { id, ok: false, error: `Unknown job type: ${(job as AudioJob).type}` };
    }

    // Set the correct id on the response
    response.id = id;

    // Transfer the Uint8Array buffer if present
    if ('data' in response) {
      const buf = (response as { data: Uint8Array }).data.buffer;
      self.postMessage(response, { transfer: [buf] });
    } else {
      self.postMessage(response);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    postMessage({ id, ok: false, error: errorMsg } satisfies WorkerResponse);
  }
};
