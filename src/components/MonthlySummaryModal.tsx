import React, { useState, useRef } from 'react';
import { InstansiSetting, LaporanRKP, UserPegawai } from '../types';
import {
  X,
  Printer,
  Download,
  Calendar,
  Layers,
  FileCheck2,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  formatDateIndonesian,
  calculateDurationMinutes,
  formatDuration,
  aggregateStatistics,
  getKopSuratHeaderFontSize,
  getReportPdfFileName
} from '../utils/reportUtils';
import { renderElementToSafeCanvas, saveCanvasToA4Pdf } from '../utils/pdfExportHelper';

interface MonthlySummaryModalProps {
  reports: LaporanRKP[];
  instansi: InstansiSetting;
  pegawai: UserPegawai;
  onClose: () => void;
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  reports,
  instansi,
  pegawai,
  onClose
}) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  // Equal unified font size for all 3 Kop Surat title lines
  const kopHeaderFont = getKopSuratHeaderFontSize(
    instansi.nama_instansi_atas,
    instansi.nama_dinas,
    instansi.nama_unit_kerja,
    'print'
  );

  // Filter reports for the chosen month
  const monthlyReports = reports
    .filter((r) => r.tanggal.startsWith(selectedMonth))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const stats = aggregateStatistics(monthlyReports);

  // Parse month name
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthTitle = `${monthNames[parseInt(monthStr, 10) - 1] || ''} ${yearStr}`;

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
      handleDownloadPdf();
    }
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const canvas = await renderElementToSafeCanvas(documentRef.current, 2);
      const fileName = getReportPdfFileName(selectedMonth);
      saveCanvasToA4Pdf(canvas, fileName, false);
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Rekapitulasi Laporan Kinerja Bulanan ASN
              </h3>
              <p className="text-xs text-slate-400">
                Laporan Akumulasi Kinerja & Rekapitulasi Bukti Dukung untuk Penilaian SKP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* A4 Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Kertas: <strong>A4</strong> (210×297mm)
            </span>

            {/* Month Picker */}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Calendar className="w-4 h-4 text-blue-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Cetak Rekap</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-900/30 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh Rekap PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Container (Strict A4 Standard 210mm x 297mm) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
          <div
            id="printable-document"
            ref={documentRef}
            className="font-[Arial,sans-serif]"
            style={{
              width: '210mm',
              minHeight: '297mm',
              maxWidth: '100%',
              boxSizing: 'border-box',
              padding: '10mm 14mm 10mm 14mm',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: '9pt',
              lineHeight: 1.25,
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.25)',
              border: '1px solid #d1d5db'
            }}
          >
            {/* Kop Surat Kemensos & Unit Kerja Sekolah Rakyat */}
            <table
              className="kop-table"
              style={{
                width: '100%',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <tbody>
                <tr>
                  {/* Logo Kiri: Sekolah Rakyat */}
                  <td style={{ width: '68px', textAlign: 'center', verticalAlign: 'middle', padding: '0 2px' }}>
                    <img
                      src={instansi.logo_kiri || instansi.logo_path}
                      width="62"
                      alt="Logo Unit Kerja Sekolah Rakyat"
                      style={{ maxHeight: '72px', maxWidth: '62px', objectFit: 'contain' }}
                    />
                  </td>
                  {/* Teks Tengah (Kemensos & Sekolah Rakyat Besar Sama, Pusat Pendidikan Lebih Kecil, Sedikit Mepet Logo) */}
                  <td style={{ textAlign: 'center', padding: '0 4px' }}>
                    {/* Baris 1: Kementerian Sosial (Besar) */}
                    <div
                      style={{
                        margin: 0,
                        fontSize: kopHeaderFont.mainFontSizeCss,
                        fontWeight: 'bold',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        color: '#000',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.25
                      }}
                    >
                      {instansi.nama_instansi_atas}
                    </div>
                    {/* Baris 2: Pusat Pendidikan / Dinas / Ditjen (Lebih Kecil Karena Panjang) */}
                    <div
                      style={{
                        margin: '2px 0',
                        fontSize: kopHeaderFont.subFontSizeCss,
                        fontWeight: '600',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        color: '#111',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.25
                      }}
                    >
                      {instansi.nama_dinas}
                    </div>
                    {/* Baris 3: Sekolah Rakyat (Besar Sama Dengan Baris 1) */}
                    <div
                      style={{
                        margin: '2px 0 3px 0',
                        fontSize: kopHeaderFont.mainFontSizeCss,
                        fontWeight: 'bold',
                        letterSpacing: '0.4px',
                        textTransform: 'uppercase',
                        color: '#000',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.25
                      }}
                    >
                      {instansi.nama_unit_kerja || 'SEKOLAH RAKYAT'}
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '8.5pt', lineHeight: 1.3, color: '#333' }}>
                      {instansi.alamat_instansi}
                    </p>
                  </td>
                  {/* Logo Kanan: Kemensos */}
                  <td style={{ width: '68px', textAlign: 'center', verticalAlign: 'middle', padding: '0 2px' }}>
                    <img
                      src={instansi.logo_kanan || instansi.logo_path}
                      width="62"
                      alt="Logo Kementerian Sosial RI"
                      style={{ maxHeight: '72px', maxWidth: '62px', objectFit: 'contain' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Garis Ganda Pemisah Kop Surat (Beri jarak aman agar tidak menimpa teks alamat) */}
            <div
              className="kop-divider"
              style={{
                borderBottom: '2.5px double #000',
                marginTop: '6px',
                marginBottom: '14px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            />

            {/* Judul Dokumen Rekapitulasi */}
            <div
              className="judul"
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                margin: '12px 0 10px 0',
                textDecoration: 'underline',
                fontSize: '12pt',
                textTransform: 'uppercase',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              REKAPITULASI LAPORAN HASIL KINERJA BULAN {monthTitle}
            </div>

            {/* Biodata */}
            <table
              className="biodata-table"
              style={{
                width: '100%',
                fontSize: '9.5pt',
                marginBottom: '14px',
                borderCollapse: 'collapse',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <tbody>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ width: '22%', padding: '2px 0' }}>Nama Pegawai</td>
                  <td style={{ width: '2%', padding: '2px 0' }}>:</td>
                  <td style={{ fontWeight: 'bold', padding: '2px 0' }}>{pegawai.nama}</td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: '2px 0' }}>NIP</td>
                  <td style={{ padding: '2px 0' }}>:</td>
                  <td style={{ padding: '2px 0' }}>{pegawai.nip}</td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: '2px 0' }}>Jabatan / Unit Kerja</td>
                  <td style={{ padding: '2px 0' }}>:</td>
                  <td style={{ padding: '2px 0' }}>{pegawai.jabatan} / {pegawai.unit_kerja}</td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: '2px 0' }}>Periode Penilaian</td>
                  <td style={{ padding: '2px 0' }}>:</td>
                  <td style={{ fontWeight: 'bold', padding: '2px 0' }}>Bulan {monthTitle}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '10px 14px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '9pt',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <span><strong>Total Kegiatan:</strong> {stats.totalLaporan} Kegiatan</span>
              <span><strong>Total Waktu Kinerja:</strong> {stats.totalJamFormatted}</span>
              <span><strong>Total Bukti Foto:</strong> {stats.totalBukti} Lampiran</span>
              <span><strong>Status:</strong> {stats.disetujuiCount} Disetujui ({stats.persentaseDisetujui}%)</span>
            </div>

            {/* Tabel Rincian Rekap */}
            <table
              className="rekap-table"
              style={{
                width: '100%',
                fontSize: '9pt',
                marginBottom: '18px',
                borderCollapse: 'collapse',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#eeeeee', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <th style={{ border: '1px solid #000', padding: '6px 5px', width: '5%', textAlign: 'center' }}>
                    No
                  </th>
                  <th style={{ border: '1px solid #000', padding: '6px 6px', width: '15%', textAlign: 'center' }}>
                    Tanggal & Waktu
                  </th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '45%', textAlign: 'center' }}>
                    Uraian Kegiatan
                  </th>
                  <th style={{ border: '1px solid #000', padding: '6px 6px', width: '15%', textAlign: 'center' }}>
                    Output
                  </th>
                  <th style={{ border: '1px solid #000', padding: '6px 6px', width: '20%', textAlign: 'center' }}>
                    Bukti Fisik Terlampir
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyReports.length === 0 ? (
                  <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <td
                      colSpan={5}
                      style={{
                        border: '1px solid #000',
                        padding: '16px',
                        textAlign: 'center',
                        color: '#666',
                        fontStyle: 'italic'
                      }}
                    >
                      Tidak ada laporan kegiatan yang tercatat pada bulan {monthTitle}.
                    </td>
                  </tr>
                ) : (
                  monthlyReports.map((rep, idx) => (
                    <tr key={rep.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <td style={{ border: '1px solid #000', padding: '6px 5px', textAlign: 'center', verticalAlign: 'top' }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 6px', textAlign: 'center', verticalAlign: 'top' }}>
                        <div>{rep.tanggal}</div>
                        <div style={{ fontSize: '8pt', color: '#555' }}>
                          {rep.jam_mulai} - {rep.jam_selesai}
                        </div>
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top', textAlign: 'justify' }}>
                        <div style={{ fontWeight: '500', lineHeight: 1.35 }}>{rep.uraian_kegiatan}</div>
                        {rep.kategori_skp && (
                          <div style={{ fontSize: '8pt', color: '#1e3a8a', marginTop: '4px', fontWeight: 'bold' }}>
                            Rencana Kinerja (RKP): {rep.kategori_skp}
                          </div>
                        )}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 6px', textAlign: 'center', verticalAlign: 'top' }}>
                        {rep.volume} {rep.satuan}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 6px', verticalAlign: 'top', fontSize: '8.5pt' }}>
                        {rep.lampiran && rep.lampiran.length > 0 ? (
                          <div>
                            <strong>{rep.lampiran.length} Foto:</strong>
                            <ul style={{ margin: '3px 0 0 12px', padding: 0 }}>
                              {rep.lampiran.map((f, i) => (
                                <li key={f.id || i} style={{ fontStyle: 'italic', lineHeight: 1.3 }}>
                                  {f.deskripsi_foto || 'Dokumentasi kegiatan'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span style={{ color: '#888', fontStyle: 'italic' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Tanda Tangan Pegawai (Rata Kanan) */}
            <table
              className="ttd-table area-tanda-tangan"
              style={{
                width: '100%',
                marginTop: '22px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <tbody>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ width: '55%', pageBreakInside: 'avoid', breakInside: 'avoid' }}></td>
                  <td style={{ width: '45%', textAlign: 'center', fontSize: '9.5pt', verticalAlign: 'top', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {instansi.kota_tanda_tangan}, 30 {monthTitle}<br />
                    Pegawai yang Bersangkutan,
                    <div style={{ height: '42px' }}></div>
                    <u><strong>{pegawai.nama}</strong></u><br />
                    NIP. {pegawai.nip}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
