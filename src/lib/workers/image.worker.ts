import type { ImageJob, WorkerResponse, WorkerProgress } from './types';

function postProgress(id: number, progress: number, message: string) {
  self.postMessage({ id, progress, message } satisfies WorkerProgress);
}

// 3x3 Convolution helper for sharpen and blur filters
function applyConvolution3x3(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  divisor = 1,
  offset = 0
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(pixels.length);
  const half = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -half; ky <= half; ky++) {
        const py = Math.min(height - 1, Math.max(0, y + ky));
        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const idx = (py * width + px) * 4;
          const kVal = kernel[(ky + half) * 3 + (kx + half)];

          r += pixels[idx] * kVal;
          g += pixels[idx + 1] * kVal;
          b += pixels[idx + 2] * kVal;
        }
      }

      const dstIdx = (y * width + x) * 4;
      output[dstIdx] = Math.min(255, Math.max(0, r / divisor + offset));
      output[dstIdx + 1] = Math.min(255, Math.max(0, g / divisor + offset));
      output[dstIdx + 2] = Math.min(255, Math.max(0, b / divisor + offset));
      output[dstIdx + 3] = pixels[dstIdx + 3]; // Preserve alpha
    }
  }

  return output;
}

self.onmessage = async (e: MessageEvent<{ id: number; job: ImageJob }>) => {
  const { id, job } = e.data;

  try {
    postProgress(id, 0.1, 'Decoding image...');

    // 1. Decode original image via createImageBitmap off-thread
    const sourceBlob = new Blob([job.file.buffer as ArrayBuffer]);
    const bitmap = await createImageBitmap(sourceBlob);
    const bw = bitmap.width;
    const bh = bitmap.height;

    postProgress(id, 0.3, 'Applying transformations...');

    // 2. Compute rotation and flip dimensions
    const rotate = ((job.rotate || 0) % 360 + 360) % 360;
    const isRotated90 = rotate === 90 || rotate === 270;
    const rw = isRotated90 ? bh : bw;
    const rh = isRotated90 ? bw : bh;

    // First canvas handles rotation & flipping
    const canvas1 = new OffscreenCanvas(rw, rh);
    const ctx1 = canvas1.getContext('2d');
    if (!ctx1) throw new Error('Could not get 2D context from OffscreenCanvas');

    ctx1.translate(rw / 2, rh / 2);
    ctx1.rotate((rotate * Math.PI) / 180);
    const flipH = job.flip?.horizontal ? -1 : 1;
    const flipV = job.flip?.vertical ? -1 : 1;
    ctx1.scale(flipH, flipV);
    ctx1.drawImage(bitmap, -bw / 2, -bh / 2);
    bitmap.close();

    // 3. Handle Crop & Resize
    let cropX = 0;
    let cropY = 0;
    let cropW = rw;
    let cropH = rh;

    if (job.crop) {
      cropX = Math.max(0, Math.min(rw, job.crop.x));
      cropY = Math.max(0, Math.min(rh, job.crop.y));
      cropW = Math.max(1, Math.min(rw - cropX, job.crop.width));
      cropH = Math.max(1, Math.min(rh - cropY, job.crop.height));
    }

    const finalW = Math.max(1, Math.round(job.resize?.width || cropW));
    const finalH = Math.max(1, Math.round(job.resize?.height || cropH));

    const finalCanvas = new OffscreenCanvas(finalW, finalH);
    const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (!finalCtx) throw new Error('Could not get 2D context for final canvas');

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(canvas1, cropX, cropY, cropW, cropH, 0, 0, finalW, finalH);

    postProgress(id, 0.5, 'Processing color adjustments & filters...');

    // 4. Pixel adjustments and Artistic Filters
    const adj = job.adjustments || {};
    const hasAdj =
      (adj.brightness ?? 0) !== 0 ||
      (adj.contrast ?? 0) !== 0 ||
      (adj.saturation ?? 0) !== 0 ||
      (adj.exposure ?? 0) !== 0 ||
      (adj.temperature ?? 0) !== 0;

    const filter = job.filter || 'none';
    const hasFilter = filter !== 'none';

    if (hasAdj || hasFilter) {
      const imgData = finalCtx.getImageData(0, 0, finalW, finalH);
      const pixels = imgData.data;

      // Apply convolution filters first if requested
      if (filter === 'sharpen') {
        const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const convolved = applyConvolution3x3(pixels, finalW, finalH, sharpenKernel);
        imgData.data.set(convolved);
      } else if (filter === 'blur') {
        const blurKernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        const convolved = applyConvolution3x3(pixels, finalW, finalH, blurKernel, 9);
        imgData.data.set(convolved);
      }

      // Pre-compute adjustment factors
      const brightnessOffset = (adj.brightness || 0) * 2.55;
      const exposureFactor = Math.pow(2, (adj.exposure || 0) / 50);
      const contrastVal = adj.contrast || 0;
      const contrastFactor =
        contrastVal === 100
          ? 255
          : (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));
      const satVal = adj.saturation || 0;
      const satFactor = 1 + satVal / 100;
      const tempVal = adj.temperature || 0; // positive = warmer (more R, less B), negative = cooler

      for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        // Exposure
        if (exposureFactor !== 1) {
          r *= exposureFactor;
          g *= exposureFactor;
          b *= exposureFactor;
        }

        // Brightness
        if (brightnessOffset !== 0) {
          r += brightnessOffset;
          g += brightnessOffset;
          b += brightnessOffset;
        }

        // Contrast
        if (contrastVal !== 0) {
          r = (r - 128) * contrastFactor + 128;
          g = (g - 128) * contrastFactor + 128;
          b = (b - 128) * contrastFactor + 128;
        }

        // Saturation
        if (satVal !== 0) {
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          r = luma + (r - luma) * satFactor;
          g = luma + (g - luma) * satFactor;
          b = luma + (b - luma) * satFactor;
        }

        // Temperature
        if (tempVal !== 0) {
          r += tempVal * 1.2;
          b -= tempVal * 1.2;
        }

        // Preset Filters
        if (filter === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray;
          g = gray;
          b = gray;
        } else if (filter === 'sepia') {
          const sr = 0.393 * r + 0.769 * g + 0.189 * b;
          const sg = 0.349 * r + 0.686 * g + 0.168 * b;
          const sb = 0.272 * r + 0.534 * g + 0.131 * b;
          r = sr;
          g = sg;
          b = sb;
        } else if (filter === 'invert') {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        } else if (filter === 'vintage') {
          // Warm vintage tone with slight faded contrast
          const vr = r * 1.1 + 15;
          const vg = g * 0.95 + 10;
          const vb = b * 0.8 + 20;
          r = vr;
          g = vg;
          b = vb;
        } else if (filter === 'dramatic') {
          // Punchy high-contrast with deep blacks
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          r = (r - 128) * 1.35 + 128 + (r - luma) * 0.25;
          g = (g - 128) * 1.35 + 128 + (g - luma) * 0.25;
          b = (b - 128) * 1.35 + 128 + (b - luma) * 0.25;
        } else if (filter === 'warm') {
          r = r * 1.15;
          b = b * 0.88;
        } else if (filter === 'cool') {
          r = r * 0.88;
          b = b * 1.15;
        }

        pixels[i] = Math.min(255, Math.max(0, r));
        pixels[i + 1] = Math.min(255, Math.max(0, g));
        pixels[i + 2] = Math.min(255, Math.max(0, b));
      }

      finalCtx.putImageData(imgData, 0, 0);
    }

    postProgress(id, 0.8, 'Encoding export format...');

    // 5. Convert to requested format and quality
    const format = job.export.format || 'image/png';
    const quality = job.export.quality ?? 0.92;

    const blob = await finalCanvas.convertToBlob({ type: format, quality });
    const buffer = await blob.arrayBuffer();
    const resultData = new Uint8Array(buffer);

    postProgress(id, 1, 'Complete');

    // 6. Zero-copy transfer back to client
    self.postMessage(
      {
        id,
        ok: true,
        data: resultData,
        name: job.export.fileName,
      } satisfies WorkerResponse,
      { transfer: [resultData.buffer] }
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, ok: false, error: errorMsg } satisfies WorkerResponse);
  }
};
