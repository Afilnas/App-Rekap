import { LaporanRKP } from '../types';

/**
 * Calculates duration in minutes between two HH:mm strings.
 */
export function calculateDurationMinutes(jamMulai: string, jamSelesai: string): number {
  if (!jamMulai || !jamSelesai) return 0;
  const [startH, startM] = jamMulai.split(':').map(Number);
  const [endH, endM] = jamSelesai.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (endTotal >= startTotal) {
    return endTotal - startTotal;
  }
  // Handles overnight span if any
  return (24 * 60 - startTotal) + endTotal;
}

/**
 * Formats minutes into human-readable Indonesian text (e.g. "2 Jam 30 Menit" or "45 Menit")
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 Menit';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} Jam ${mins} Menit`;
  }
  if (hours > 0) {
    return `${hours} Jam`;
  }
  return `${mins} Menit`;
}

/**
 * Formats YYYY-MM-DD into Indonesian official date string.
 * Example: "2026-11-09" -> "Senin, 9 November 2026"
 */
export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Computes target scaled dimensions preserving aspect ratio,
 * clamping within maxWidth and maxHeight (default 900px as recommended for PDF RKP).
 */
export function calculateTargetDimensions(
  width: number,
  height: number,
  maxWidth = 900,
  maxHeight = 900
): { width: number; height: number; scale: number } {
  if (width <= 0 || height <= 0) {
    return { width: 0, height: 0, scale: 1 };
  }

  if (width <= maxWidth && height <= maxHeight) {
    return { width, height, scale: 1 };
  }

  const ratioW = maxWidth / width;
  const ratioH = maxHeight / height;
  const scale = Math.min(ratioW, ratioH);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale
  };
}

/**
 * Formats file size in bytes to readable string (KB or MB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Calculates compression percentage saved
 */
export function calculateCompressionSavings(originalBytes?: number, compressedBytes?: number): number {
  if (!originalBytes || !compressedBytes || originalBytes <= 0 || compressedBytes >= originalBytes) {
    return 0;
  }
  const saved = ((originalBytes - compressedBytes) / originalBytes) * 100;
  return Math.round(saved);
}

/**
 * Aggregates statistics for ASN performance summary
 */
export function aggregateStatistics(reports: LaporanRKP[]) {
  const totalLaporan = reports.length;
  let totalMinutes = 0;
  let totalBukti = 0;
  let disetujuiCount = 0;
  let menungguCount = 0;

  for (const r of reports) {
    totalMinutes += calculateDurationMinutes(r.jam_mulai, r.jam_selesai);
    totalBukti += r.lampiran ? r.lampiran.length : 0;
    if (r.status_verifikasi === 'Disetujui') disetujuiCount++;
    if (r.status_verifikasi === 'Menunggu Verifikasi') menungguCount++;
  }

  return {
    totalLaporan,
    totalMinutes,
    totalJamFormatted: formatDuration(totalMinutes),
    totalBukti,
    disetujuiCount,
    menungguCount,
    persentaseDisetujui: totalLaporan > 0 ? Math.round((disetujuiCount / totalLaporan) * 100) : 0
  };
}

/**
 * Filter reports by date, month, search query, or status
 */
export function filterReports(
  reports: LaporanRKP[],
  options: {
    search?: string;
    date?: string;
    month?: string; // YYYY-MM
    status?: string;
  }
): LaporanRKP[] {
  return reports.filter((r) => {
    if (options.date && r.tanggal !== options.date) {
      return false;
    }
    if (options.month && !r.tanggal.startsWith(options.month)) {
      return false;
    }
    if (options.status && options.status !== 'Semua' && r.status_verifikasi !== options.status) {
      return false;
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      const matchUraian = r.uraian_kegiatan.toLowerCase().includes(q);
      const matchKeterangan = r.keterangan.toLowerCase().includes(q);
      const matchBukti = r.lampiran?.some(l => l.deskripsi_foto.toLowerCase().includes(q));
      if (!matchUraian && !matchKeterangan && !matchBukti) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Calculates font sizes for the 3 official header lines of Kop Surat:
 * 1. nama_instansi_atas (Kementerian Sosial RI) -> BESAR
 * 2. nama_dinas (Pusat Pendidikan / Ditjen) -> LEBIH KECIL KARENA PANJANG
 * 3. nama_unit_kerja (Sekolah Rakyat) -> BESAR SAMA DENGAN BARIS 1
 *
 * Rules:
 * - Ukuran font Kop diperbesar secara proporsional
 * - Kementerian Sosial & Sekolah Rakyat ukurannya SAMA BESAR dan gagah
 * - Pusat Pendidikan / Dinas / Badan ukurannya LEBIH KECIL karena teksnya biasanya panjang
 * - Jarak teks dibuat sedikit mepet dengan logo (pemberian ruang maksimal) namun tidak bersinggungan
 * - Jika teks melebihi batas, font otomatis menyesuaikan (scale-down) agar tetap 1 baris
 */
export function getKopSuratHeaderFontSize(
  namaInstansiAtas: string = '',
  namaDinas: string = '',
  namaUnitKerja: string = '',
  context: 'print' | 'preview' = 'print'
): {
  mainFontSizePt: number;
  mainFontSizeCss: string;
  subFontSizePt: number;
  subFontSizeCss: string;
  fontSizePt: number;
  fontSizeCss: string;
  maxChars: number;
} {
  const t1 = (namaInstansiAtas || '').trim();
  const t2 = (namaDinas || '').trim();
  const t3 = (namaUnitKerja || '').trim();
  
  // Length of Line 1 and Line 3 (Kemensos & Sekolah Rakyat)
  const maxMainChars = Math.max(t1.length, t3.length, 1);
  // Length of Line 2 (Pusat Pendidikan / Ditjen / Dinas)
  const subChars = Math.max(t2.length, 1);
  const maxChars = Math.max(maxMainChars, subChars);

  if (context === 'preview') {
    // In SettingsModal preview card (compact width ~380-420px)
    // Main (Line 1 & 3): Besar
    let mainPt = 11.2;
    if (maxMainChars > 50) {
      mainPt = 8.2;
    } else if (maxMainChars > 40) {
      mainPt = 9.2;
    } else if (maxMainChars > 30) {
      mainPt = 10.2;
    }

    // Sub (Line 2 - Pusat Pendidikan): Lebih kecil karena panjang
    let subPt = 9.0;
    if (subChars > 52) {
      subPt = 6.8;
    } else if (subChars > 40) {
      subPt = 7.6;
    } else if (subChars > 30) {
      subPt = 8.3;
    }

    return {
      mainFontSizePt: mainPt,
      mainFontSizeCss: `${mainPt}pt`,
      subFontSizePt: subPt,
      subFontSizeCss: `${subPt}pt`,
      fontSizePt: mainPt,
      fontSizeCss: `${mainPt}pt`,
      maxChars
    };
  }

  // Print & PDF Document context (A4 portrait width 210mm, with tighter logo padding ~510-530px usable width)
  // 1. Line 1 (Kemensos) & Line 3 (Sekolah Rakyat): BESAR SAMA
  let mainPt = 14.0;
  if (maxMainChars > 54) {
    mainPt = 10.8;
  } else if (maxMainChars > 44) {
    mainPt = 12.0;
  } else if (maxMainChars > 37) {
    mainPt = 13.0;
  }

  // 2. Line 2 (Pusat Pendidikan / Ditjen / Dinas): LEBIH KECIL KARENA PANJANG
  let subPt = 11.2;
  if (subChars > 60) {
    subPt = 8.6;
  } else if (subChars > 46) {
    subPt = 9.6;
  } else if (subChars > 36) {
    subPt = 10.5;
  }

  return {
    mainFontSizePt: mainPt,
    mainFontSizeCss: `${mainPt}pt`,
    subFontSizePt: subPt,
    subFontSizeCss: `${subPt}pt`,
    fontSizePt: mainPt,
    fontSizeCss: `${mainPt}pt`,
    maxChars
  };
}

/**
 * Generates the standardized official PDF download filename.
 * Pattern requested: "tanggal laporan_rhk" -> e.g. "2026-11-09_rhk.pdf"
 */
export function getReportPdfFileName(tanggal: string): string {
  const safeDate = (tanggal || new Date().toISOString().substring(0, 10)).trim();
  return `${safeDate}_rhk.pdf`;
}
