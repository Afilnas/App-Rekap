import { calculateTargetDimensions } from './reportUtils';

export interface CompressedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  fileName: string;
}

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Clamps dimensions to maxWidth/maxHeight (default 900px) and quality (default 0.75).
 * Dramatically reduces typical smartphone photos (3-10MB) down to 100-250KB,
 * ensuring high performance rendering and preventing PDF generator memory exhaustion.
 */
export async function compressImage(
  file: File,
  maxWidth = 950,
  maxHeight = 950,
  quality = 0.75
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('Format gambar tidak didukung'));
      img.onload = () => {
        const { width, height } = calculateTargetDimensions(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          maxWidth,
          maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Gagal menginisialisasi 2D Canvas context'));
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to standard JPEG for universal PDF & browser compatibility
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate approximate size in bytes from base64 string
        const base64Data = dataUrl.split(',')[1] || '';
        const compressedSize = Math.round((base64Data.length * 3) / 4);

        const savingsPercent = Math.max(
          0,
          Math.round(((originalSize - compressedSize) / originalSize) * 100)
        );

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          savingsPercent,
          width,
          height,
          fileName: file.name
        });
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an uploaded logo file preserving PNG/SVG transparency.
 * Clamps max dimensions to 320x320 pixels to keep storage size small (<50KB)
 * while ensuring crystal sharp rendering on Kop Surat printouts.
 */
export async function processLogoFile(file: File): Promise<string> {
  // If SVG, read as Data URL directly
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca berkas SVG'));
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar logo'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas logo tidak valid'));
      img.onload = () => {
        const maxWidth = 320;
        const maxHeight = 320;
        const { width, height } = calculateTargetDimensions(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          maxWidth,
          maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Gagal memproses canvas logo'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG format to preserve alpha channel transparency
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        const outputMime = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, 0.9);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

