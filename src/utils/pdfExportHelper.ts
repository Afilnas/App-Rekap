import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 1x1 offscreen canvas for browser-native conversion of any CSS color format (oklch, lab, color()) to standard RGBA
let helperCanvas: HTMLCanvasElement | null = null;
let helperCtx: CanvasRenderingContext2D | null = null;
const colorCache = new Map<string, string>();

function sanitizeOklchString(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch(')) {
    return str;
  }

  if (typeof document === 'undefined') return str;

  if (!helperCanvas) {
    helperCanvas = document.createElement('canvas');
    helperCanvas.width = 1;
    helperCanvas.height = 1;
    helperCtx = helperCanvas.getContext('2d', { willReadFrequently: true });
  }

  if (!helperCtx) return str;

  return str.replace(/oklch\([^)]+\)/g, (match) => {
    if (colorCache.has(match)) {
      return colorCache.get(match)!;
    }
    try {
      helperCtx!.clearRect(0, 0, 1, 1);
      helperCtx!.fillStyle = match;
      helperCtx!.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = helperCtx!.getImageData(0, 0, 1, 1).data;
      const converted = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
      colorCache.set(match, converted);
      return converted;
    } catch {
      return 'rgba(0, 0, 0, 1)';
    }
  });
}

function createSafeStyleProxy(computed: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(computed, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return function (name: string) {
          const raw = target.getPropertyValue(name);
          return sanitizeOklchString(raw);
        };
      }
      const val = typeof (target as any)[prop] === 'function' ? (target as any)[prop].bind(target) : (target as any)[prop];
      if (typeof val === 'string' && val.includes('oklch(')) {
        return sanitizeOklchString(val);
      }
      return val;
    }
  });
}

/**
 * Robustly captures an HTML element into an HTMLCanvasElement while transparently
 * converting any Tailwind CSS v4 oklch colors into standard RGB/RGBA colors,
 * preventing html2canvas unsupported color function crashes.
 */
export async function renderElementToSafeCanvas(
  element: HTMLElement,
  customScale = 2
): Promise<HTMLCanvasElement> {
  const originalGetComputedStyle = window.getComputedStyle;

  // Intercept window.getComputedStyle during html2canvas traversal
  window.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
    const computed = originalGetComputedStyle.call(window, el, pseudoElt);
    return createSafeStyleProxy(computed);
  };

  try {
    return await html2canvas(element, {
      scale: customScale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Intercept clonedDoc window as well
        if (clonedDoc.defaultView) {
          const clonedOrig = clonedDoc.defaultView.getComputedStyle;
          clonedDoc.defaultView.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
            const computed = clonedOrig.call(clonedDoc.defaultView, el, pseudoElt);
            return createSafeStyleProxy(computed);
          };
        }

        const printable = clonedDoc.getElementById('printable-document');
        if (printable) {
          printable.style.boxShadow = 'none';
          printable.style.border = 'none';
          printable.style.backgroundColor = '#ffffff';
          printable.style.color = '#000000';
        }

        const overrideStyle = clonedDoc.createElement('style');
        overrideStyle.innerHTML = `
          *, *::before, *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          #printable-document {
            background-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #printable-document table,
          #printable-document .kop-table,
          #printable-document .kop-divider,
          #printable-document .biodata-table,
          #printable-document .kegiatan-table,
          #printable-document .foto-table,
          #printable-document .foto-box,
          #printable-document .ttd-table,
          #printable-document .area-tanda-tangan,
          #printable-document .rekap-table,
          #printable-document .judul,
          #printable-document .sub-judul,
          #printable-document tr,
          #printable-document th,
          #printable-document td {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            break-inside: avoid-page !important;
          }
          #printable-document table {
            border-collapse: collapse !important;
          }
          #printable-document thead {
            display: table-header-group !important;
          }
          #printable-document tfoot {
            display: table-footer-group !important;
          }
        `;
        clonedDoc.head.appendChild(overrideStyle);
      }
    });
  } finally {
    window.getComputedStyle = originalGetComputedStyle;
  }
}

/**
 * Downloads the captured canvas as a standardized A4 government PDF.
 * Enforces single-page proportion when requested so all content fits on 1 sheet.
 */
export function saveCanvasToA4Pdf(
  canvas: HTMLCanvasElement,
  fileName: string,
  forceSingleSheet = true
): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgHeight = (pdfWidth * canvas.height) / canvas.width;

  // Single sheet fit guarantee ("SEMUA HARUS MASUK LEMBAR LAPORAN")
  // If forceSingleSheet is true or image height fits within 1.25x of A4, scale it to fit 100% on 1 sheet
  if (forceSingleSheet || imgHeight <= pdfHeight * 1.25) {
    const scaleFactor = imgHeight > pdfHeight ? (pdfHeight - 2) / imgHeight : 1;
    const renderedWidth = pdfWidth * scaleFactor;
    const renderedHeight = imgHeight * scaleFactor;
    const offsetX = (pdfWidth - renderedWidth) / 2;
    const offsetY = Math.max(0, ((pdfHeight - renderedHeight) / 2) * 0.1);
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderedWidth, renderedHeight, undefined, 'FAST');
  } else {
    // Multi-page only for very large bulk reports
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 8) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(fileName);
  return pdf;
}
