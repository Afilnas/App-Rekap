import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDurationMinutes,
  formatDuration,
  formatDateIndonesian,
  calculateTargetDimensions,
  calculateCompressionSavings,
  formatFileSize,
  aggregateStatistics,
  filterReports,
  getKopSuratHeaderFontSize,
  getReportPdfFileName
} from './reportUtils';
import { LaporanRKP } from '../types';
import { PRESET_LOGOS, DEFAULT_INSTANSI } from './defaultData';

test('calculateDurationMinutes calculates correct interval', () => {
  assert.equal(calculateDurationMinutes('08:00', '10:30'), 150);
  assert.equal(calculateDurationMinutes('13:00', '14:00'), 60);
  assert.equal(calculateDurationMinutes('09:15', '09:45'), 30);
  assert.equal(calculateDurationMinutes('', '10:00'), 0);
});

test('formatDuration outputs proper Indonesian wording', () => {
  assert.equal(formatDuration(150), '2 Jam 30 Menit');
  assert.equal(formatDuration(60), '1 Jam');
  assert.equal(formatDuration(45), '45 Menit');
  assert.equal(formatDuration(0), '0 Menit');
});

test('formatDateIndonesian formats date in government standard', () => {
  // 2026-11-09 is Monday (Senin)
  assert.equal(formatDateIndonesian('2026-11-09'), 'Senin, 9 November 2026');
  assert.equal(formatDateIndonesian('2026-08-17'), 'Senin, 17 Agustus 2026');
  assert.equal(formatDateIndonesian(''), '-');
});

test('calculateTargetDimensions clamps large images to max bounds maintaining aspect ratio', () => {
  // 4000x3000 photo (smartphone 12MP) clamped to max 1000x1000
  const result = calculateTargetDimensions(4000, 3000, 1000, 1000);
  assert.equal(result.width, 1000);
  assert.equal(result.height, 750);
  assert.equal(result.scale, 0.25);

  // Portrait 3000x4000 photo
  const portrait = calculateTargetDimensions(3000, 4000, 1000, 1000);
  assert.equal(portrait.width, 750);
  assert.equal(portrait.height, 1000);

  // Smaller image stays untouched
  const small = calculateTargetDimensions(600, 400, 1000, 1000);
  assert.equal(small.width, 600);
  assert.equal(small.height, 400);
  assert.equal(small.scale, 1);
});

test('calculateCompressionSavings and formatFileSize work accurately', () => {
  // 3.5 MB compressed to 250 KB
  const original = 3.5 * 1024 * 1024;
  const compressed = 250 * 1024;
  const savings = calculateCompressionSavings(original, compressed);
  assert.ok(savings > 90, 'Compression savings should be above 90%');

  assert.equal(formatFileSize(512 * 1024), '512.0 KB');
  assert.equal(formatFileSize(2.5 * 1024 * 1024), '2.50 MB');
});

test('aggregateStatistics and filterReports correctly evaluate collections', () => {
  const mockReports: LaporanRKP[] = [
    {
      id: '1',
      tanggal: '2026-11-09',
      jam_mulai: '08:00',
      jam_selesai: '10:00',
      uraian_kegiatan: 'Rapat Koordinasi Penataan Jaringan SPBE',
      volume: 1,
      satuan: 'Laporan',
      keterangan: 'Selesai',
      status_verifikasi: 'Disetujui',
      lampiran: [
        {
          id: 'l1',
          laporan_id: '1',
          file_path: 'data:image/png;base64,...',
          deskripsi_foto: 'Foto suasana ruang rapat lantai 3',
          created_at: '2026-11-09T10:00:00Z'
        }
      ],
      created_at: '2026-11-09',
      updated_at: '2026-11-09'
    },
    {
      id: '2',
      tanggal: '2026-11-09',
      jam_mulai: '10:30',
      jam_selesai: '12:00',
      uraian_kegiatan: 'Tinjauan Lapangan Server Data Center Diskominfo',
      volume: 1,
      satuan: 'Kegiatan',
      keterangan: 'Pemeriksaan suhu dan rak server',
      status_verifikasi: 'Menunggu Verifikasi',
      lampiran: [
        {
          id: 'l2',
          laporan_id: '2',
          file_path: 'data:image/png;base64,...',
          deskripsi_foto: 'Pengecekan rack server 04',
          created_at: '2026-11-09T12:00:00Z'
        },
        {
          id: 'l3',
          laporan_id: '2',
          file_path: 'data:image/png;base64,...',
          deskripsi_foto: 'Inspeksi pendingin Precision Air Conditioning',
          created_at: '2026-11-09T12:00:00Z'
        }
      ],
      created_at: '2026-11-09',
      updated_at: '2026-11-09'
    }
  ];

  const stats = aggregateStatistics(mockReports);
  assert.equal(stats.totalLaporan, 2);
  assert.equal(stats.totalMinutes, 120 + 90); // 210 mins
  assert.equal(stats.totalJamFormatted, '3 Jam 30 Menit');
  assert.equal(stats.totalBukti, 3);
  assert.equal(stats.disetujuiCount, 1);
  assert.equal(stats.menungguCount, 1);

  // Test filter by search
  const searchResults = filterReports(mockReports, { search: 'SPBE' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  // Test filter by date
  const dateResults = filterReports(mockReports, { date: '2026-11-09' });
  assert.equal(dateResults.length, 2);
});

test('PRESET_LOGOS contains valid government SVG logos and configurations', () => {
  assert.ok(PRESET_LOGOS.length >= 5, 'Should provide at least 5 preset government logos');
  
  for (const preset of PRESET_LOGOS) {
    assert.ok(preset.id, 'Preset must have an id');
    assert.ok(preset.nama, 'Preset must have a name');
    assert.ok(preset.src && preset.src.startsWith('data:image/'), 'Preset must be valid data URI');
  }

  // Validate default instansi has left and right logos defined
  assert.ok(DEFAULT_INSTANSI.logo_kiri, 'Default instansi must have logo_kiri');
  assert.ok(DEFAULT_INSTANSI.logo_kanan, 'Default instansi must have logo_kanan');
  assert.ok(DEFAULT_INSTANSI.nama_unit_kerja, 'Default instansi must have nama_unit_kerja');
});

test('getKopSuratHeaderFontSize gives equal big size for Kemensos & Sekolah Rakyat, and smaller size for Pusat Pendidikan', () => {
  // Standard Kemensos & Sekolah Rakyat layout
  const standard = getKopSuratHeaderFontSize(
    'KEMENTERIAN SOSIAL REPUBLIK INDONESIA',
    'PUSAT PENDIDIKAN DAN PELATIHAN KESEJAHTERAAN SOSIAL',
    'SEKOLAH RAKYAT',
    'print'
  );
  // Kemensos (line 1) & Sekolah Rakyat (line 3) are equal and big: 14pt (or 13.0pt if > 37 chars)
  assert.equal(standard.mainFontSizePt, 14.0);
  assert.equal(standard.mainFontSizeCss, '14pt');
  
  // Pusat Pendidikan (line 2) is smaller because it is long (51 chars): 9.6pt
  assert.equal(standard.subFontSizePt, 9.6);
  assert.equal(standard.subFontSizeCss, '9.6pt');
  assert.ok(standard.mainFontSizePt > standard.subFontSizePt, 'Main titles must be larger than long center title');

  // Ditjen Rehsos layout (39 chars)
  const ditjen = getKopSuratHeaderFontSize(
    'KEMENTERIAN SOSIAL REPUBLIK INDONESIA',
    'DIREKTORAT JENDERAL REHABILITASI SOSIAL',
    'SEKOLAH RAKYAT',
    'print'
  );
  assert.equal(ditjen.mainFontSizePt, 14.0);
  assert.equal(ditjen.subFontSizePt, 10.5);

  // Extremely long agency title auto-scales
  const veryLong = getKopSuratHeaderFontSize(
    'KEMENTERIAN KOORDINATOR BIDANG PEMBANGUNAN MANUSIA DAN KEBUDAYAAN REPUBLIK INDONESIA',
    'DIREKTORAT JENDERAL PEMBERDAYAAN SOSIAL DAN PENANGANAN FAKIR MISKIN DAERAH KHUSUS',
    'BALAI BESAR PENDIDIKAN DAN PELATIHAN KESEJAHTERAAN SOSIAL REGIONAL JAWA BARAT',
    'print'
  );
  assert.ok(veryLong.mainFontSizePt <= 10.8, 'Very long main title must scale down');
  assert.ok(veryLong.subFontSizePt <= 8.6, 'Very long sub title must scale down');

  // Preview mode scaling
  const preview = getKopSuratHeaderFontSize(
    'KEMENTERIAN SOSIAL REPUBLIK INDONESIA',
    'PUSAT PENDIDIKAN DAN PELATIHAN',
    'SEKOLAH RAKYAT',
    'preview'
  );
  assert.equal(preview.mainFontSizePt, 10.2);
  assert.equal(preview.subFontSizePt, 9.0);
});

test('getReportPdfFileName formats downloaded PDF name as "tanggal laporan_rhk.pdf"', () => {
  assert.equal(getReportPdfFileName('2026-11-09'), '2026-11-09_rhk.pdf');
  assert.equal(getReportPdfFileName('2026-12-31'), '2026-12-31_rhk.pdf');
  assert.equal(getReportPdfFileName('2026-11'), '2026-11_rhk.pdf');
  // Fallback to today's date if empty
  const fallback = getReportPdfFileName('');
  assert.ok(fallback.endsWith('_rhk.pdf'));
  assert.equal(fallback.length, 18); // YYYY-MM-DD (10) + _rhk.pdf (8) = 18
});

