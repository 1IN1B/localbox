/**
 * Render an HTML string to a canvas using an inline SVG <foreignObject>.
 *
 * Why not html2canvas / html-to-image?
 * - html2canvas cannot parse modern CSS color functions (oklch/lab) used by Tailwind v4
 * - html-to-image's foreignObject pipeline hangs under COOP/COEP (require-corp)
 *
 * This approach serializes the DOM to XML and renders it inside an SVG
 * foreignObject with a scoped stylesheet. It uses the browser's own rendering
 * engine, so all modern CSS is supported. No external resources are fetched.
 */

const SCOPED_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; }
  h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; }
  h2 { font-size: 20px; font-weight: 700; margin: 14px 0 8px; }
  h3 { font-size: 17px; font-weight: 600; margin: 12px 0 6px; }
  h4, h5, h6 { font-size: 15px; font-weight: 600; margin: 10px 0 6px; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0 8px 24px; }
  li { margin: 4px 0; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; }
  td, th { border: 1px solid #ccc; padding: 6px 8px; }
  th { background: #f5f5f5; font-weight: 600; }
  img { max-width: 100%; }
  a { color: #2563eb; }
  blockquote { border-left: 3px solid #ccc; padding-left: 12px; color: #555; margin: 8px 0; }
  code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: ui-monospace, monospace; }
  pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
`;

export interface RenderedPage {
  data: Uint8Array;
  width: number;
  height: number;
}

/**
 * Render an HTML string to a tall canvas (browser engine, no library).
 */
export async function renderHtmlToCanvas(
  html: string,
  width = 800,
  pixelRatio = 2
): Promise<HTMLCanvasElement> {
  const container = document.createElement('div');
  container.style.cssText = `width:${width}px;padding:40px;background:#ffffff;color:#1a1a1a;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;`;
  container.innerHTML = html;
  document.body.appendChild(container);

  const height = container.offsetHeight;

  // Serialize to XML (valid inside SVG foreignObject) and remove from DOM
  // synchronously — no paint happens in between, so no visual flash.
  const xml = new XMLSerializer().serializeToString(container);
  document.body.removeChild(container);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <style>${SCOPED_STYLES}</style>
        ${xml}
      </div>
    </foreignObject>
  </svg>`;

  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  try {
    const img = new Image();
    img.decoding = 'sync';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to render document to image'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(pixelRatio, pixelRatio);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  } finally {
    // no-op (data URL needs no revocation)
  }
}

/**
 * Slice a tall canvas into A4-proportioned page chunks as PNG bytes.
 */
export function sliceCanvasIntoPages(canvas: HTMLCanvasElement): RenderedPage[] {
  const slices: RenderedPage[] = [];
  const a4Height = Math.floor(canvas.width * 1.414); // A4 aspect ratio
  let remainingHeight = canvas.height;
  let sourceY = 0;

  while (remainingHeight > 0) {
    const sliceHeight = Math.min(a4Height, remainingHeight);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;

    const ctx = sliceCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(
      canvas,
      0, sourceY, canvas.width, sliceHeight, // source
      0, 0, canvas.width, sliceHeight // destination
    );

    const dataUrl = sliceCanvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    slices.push({
      data: bytes,
      width: sliceCanvas.width,
      height: sliceCanvas.height,
    });

    sourceY += sliceHeight;
    remainingHeight -= sliceHeight;
  }

  return slices;
}