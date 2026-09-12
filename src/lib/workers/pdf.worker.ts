/* eslint-disable no-restricted-globals */
import { PDFDocument } from 'pdf-lib';
import { marked, type Tokens } from 'marked';

import type { PdfJob, WorkerResponse, WorkerProgress } from './types';

// Configure marked for synchronous token parsing
marked.use({ async: false });

type ResponseMessage = WorkerResponse;
type ProgressMessage = WorkerProgress;

function postProgress(progress: ProgressMessage) {
  self.postMessage(progress);
}

// --- Helpers ---

function detectImageType(data: Uint8Array, name: string): 'jpg' | 'png' {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith('.png')) return 'png';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'jpg';
  // Magic bytes check
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'png';
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'jpg';
  return 'jpg'; // default fallback
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let currentLine = '';
    for (const word of words) {
      if (currentLine.length + word.length + 1 > charsPerLine && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  }
  return lines;
}

async function createTextPdf(text: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont('Helvetica');

  const fontSize = 11;
  const margin = 50;
  const pageWidth = 612; // US Letter
  const pageHeight = 792;
  const lineHeight = fontSize * 1.4;
  const linesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

  const allLines = wrapText(text, pageWidth - 2 * margin, fontSize);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  let lineCount = 0;

  for (const line of allLines) {
    if (lineCount >= linesPerPage) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      lineCount = 0;
    }

    page.drawText(line || ' ', {
      x: margin,
      y,
      size: fontSize,
      font,
    });

    y -= lineHeight;
    lineCount++;
  }

  return pdfDoc.save();
}

// --- Job Handlers ---

async function handleMerge(files: { data: Uint8Array; name: string }[]): Promise<WorkerResponse> {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    postProgress({ id: -1, progress: (i / files.length) * 0.8, message: `Merging file ${i + 1} of ${files.length}...` });
    const pdf = await PDFDocument.load(files[i].data);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  postProgress({ id: -1, progress: 0.9, message: 'Saving merged PDF...' });
  const result = await mergedPdf.save();
  return { id: -1, ok: true, data: result, name: 'merged.pdf' };
}

async function handleSplit(file: Uint8Array, from: number, to: number): Promise<WorkerResponse> {
  postProgress({ id: -1, progress: 0.3, message: 'Loading PDF...' });
  const srcDoc = await PDFDocument.load(file);
  const totalPages = srcDoc.getPageCount();

  const start = Math.max(0, from - 1); // 1-indexed to 0-indexed
  const end = Math.min(totalPages, to); // inclusive, 1-indexed

  if (start >= end || start >= totalPages) {
    return { id: -1, ok: false, error: `Invalid page range: ${from}-${to}. Document has ${totalPages} pages.` };
  }

  postProgress({ id: -1, progress: 0.6, message: 'Extracting pages...' });
  const newPdf = await PDFDocument.create();
  const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);
  const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  postProgress({ id: -1, progress: 0.9, message: 'Saving split PDF...' });
  const result = await newPdf.save();
  return { id: -1, ok: true, data: result, name: `split_${from}-${to}.pdf` };
}

async function handleImagesToPdf(images: { data: Uint8Array; name: string }[]): Promise<WorkerResponse> {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    postProgress({ id: -1, progress: (i / images.length) * 0.8, message: `Embedding image ${i + 1} of ${images.length}...` });
    const { data, name } = images[i];
    const type = detectImageType(data, name);

    let image;
    if (type === 'png') {
      image = await pdfDoc.embedPng(data);
    } else {
      image = await pdfDoc.embedJpg(data);
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  postProgress({ id: -1, progress: 0.9, message: 'Saving PDF...' });
  const result = await pdfDoc.save();
  return { id: -1, ok: true, data: result, name: 'images.pdf' };
}

async function handleDocToPdf(job: Extract<PdfJob, { type: 'doc-to-pdf' }>): Promise<WorkerResponse> {
  const { file, kind, canvasImages } = job;

  // If we have canvas images (intermediate step completed on main thread), render each as a PDF page
  if (canvasImages && canvasImages.length > 0) {
    postProgress({ id: -1, progress: 0.5, message: 'Creating PDF from canvas images...' });
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 612; // A4 width in points

    for (let i = 0; i < canvasImages.length; i++) {
      const ci = canvasImages[i];
      const pngImage = await pdfDoc.embedPng(ci.data);
      const scale = pageWidth / ci.width;
      const pageHeight = ci.height * scale;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      postProgress({ id: -1, progress: 0.5 + (i / canvasImages.length) * 0.4, message: `Embedding page ${i + 1} of ${canvasImages.length}...` });
    }

    postProgress({ id: -1, progress: 0.9, message: 'Saving PDF...' });
    const result = await pdfDoc.save();
    const baseName = job.kind === 'docx' ? 'document.pdf' : `${job.kind}.pdf`;
    return { id: -1, ok: true, data: result, name: baseName };
  }

  if (kind === 'docx') {
    // Step 1: Convert docx → HTML using mammoth, return HTML for main thread to render
    postProgress({ id: -1, progress: 0.3, message: 'Converting DOCX to HTML...' });
    const mammoth = await import('mammoth');
    const arrayBuffer = new ArrayBuffer(file.byteLength);
    new Uint8Array(arrayBuffer).set(file);
    const result = await mammoth.default.convertToHtml({ arrayBuffer });
    return { id: -1, ok: true, html: result.value };
  }

  // txt or md — render as text PDF
  postProgress({ id: -1, progress: 0.3, message: `Processing ${kind.toUpperCase()}...` });

  let text: string;
  if (kind === 'md') {
    // Parse markdown to plain text by stripping syntax
    const tokens = marked.lexer(new TextDecoder().decode(file));
    text = tokens
      .map((token) => {
        if (token.type === 'heading') return token.text;
        if (token.type === 'paragraph') return token.text;
        if (token.type === 'list') {
          return token.items.map((item: Tokens.ListItem) => `  • ${item.text}`).join('\n');
        }
        if (token.type === 'code') return token.text;
        if (token.type === 'blockquote') return token.text;
        if (token.type === 'space') return '';
        if ('text' in token) return String(token.text);
        return '';
      })
      .join('\n\n');
  } else {
    text = new TextDecoder().decode(file);
  }

  postProgress({ id: -1, progress: 0.6, message: 'Creating PDF...' });
  const result = await createTextPdf(text);
  const baseName = `${kind}.pdf`;
  return { id: -1, ok: true, data: result, name: baseName };
}

// --- Main Message Handler ---

self.onmessage = async (e: MessageEvent<{ id: number; job: PdfJob }>) => {
  const { id, job } = e.data;

  try {
    let response: WorkerResponse;

    switch (job.type) {
      case 'merge':
        response = await handleMerge(job.files);
        break;
      case 'split':
        response = await handleSplit(job.file, job.from, job.to);
        break;
      case 'images-to-pdf':
        response = await handleImagesToPdf(job.images);
        break;
      case 'doc-to-pdf':
        response = await handleDocToPdf(job);
        break;
      default:
        response = { id, ok: false, error: `Unknown job type: ${(job as PdfJob).type}` };
    }

    // Set the correct id on the response
    response.id = id;

    // Transfer the Uint8Array buffer if present
    if ('data' in response) {
      const buf = (response as { id: number; ok: true; data: Uint8Array; name: string }).data.buffer;
      self.postMessage(response, { transfer: [buf] });
    } else {
      self.postMessage(response);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, ok: false, error: errorMsg } satisfies WorkerResponse);
  }
};
