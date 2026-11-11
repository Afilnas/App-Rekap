import React, { useRef, useState } from 'react';
import { InstansiSetting, LaporanRKP, UserPegawai } from '../types';
import {
  X,
  Printer,
  Download,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { formatDateIndonesian, getKopSuratHeaderFontSize, getReportPdfFileName } from '../utils/reportUtils';
import { renderElementToSafeCanvas, saveCanvasToA4Pdf } from '../utils/pdfExportHelper';

interface OfficialPdfPreviewProps {
  currentReport: LaporanRKP;
  allDayReports?: LaporanRKP[];
  instansi: InstansiSetting;
  pegawai: UserPegawai;
  onOpenEditKop?: () => void;
  onClose: () => void;
}

export const OfficialPdfPreview: React.FC<OfficialPdfPreviewProps> = ({
  currentReport,
  allDayReports = [],
  instansi,
  pegawai,
  onOpenEditKop,
  onClose
}) => {
  const [printScope, setPrintScope] = useState<'single' | 'full-day'>('single');
  const [pageDensity, setPageDensity] = useState<'standar' | 'kompak'>('kompak');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  // Determine which reports to render
  const reportsToRender =
    printScope === 'full-day' && allDayReports.length > 0
      ? allDayReports
      : [currentReport];

  // Collect all photos from rendered reports
  const allPhotos = reportsToRender.flatMap((r, rIdx) =>
    (r.lampiran || []).map((photo, pIdx) => ({
      ...photo,
      kegiatanLabel: reportsToRender.length > 1 ? `Kegiatan #${rIdx + 1}` : undefined
    }))
  );

  // Group photos into pairs of 2 for strict HTML table rendering
  const photoRows: Array<typeof allPhotos> = [];
  for (let i = 0; i < allPhotos.length; i += 2) {
    photoRows.push(allPhotos.slice(i, i + 2));
  }

  // Calculate unified equal font size for all 3 Kop Surat title lines
  const kopHeaderFont = getKopSuratHeaderFontSize(
    instansi.nama_instansi_atas,
    instansi.nama_dinas,
    instansi.nama_unit_kerja,
    'print'
  );

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
      const fileName = getReportPdfFileName(currentReport.tanggal);
      saveCanvasToA4Pdf(canvas, fileName, printScope === 'single');
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header / Control Toolbar */}
        <div className="no-print bg-slate-900 px-4 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Pratinjau Cetak Dokumen RKP ASN
              </h3>
              <p className="text-xs text-slate-400">
                Format Resmi Pemerintah dengan Bukti Fisik Foto & Tanda Tangan
              </p>
            </div>
          </div>

          {/* A4 Paper Badge & Layout Density Selector */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* A4 Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Kertas: <strong>A4</strong> (210×297mm)
            </span>

            {/* Density Selector */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/70">
              <button
                type="button"
                onClick={() => setPageDensity('kompak')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  pageDensity === 'kompak'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Sesuaikan tata letak agar pas dalam 1 halaman A4 dan rapi tanpa terpotong"
              >
                Kompak (1 Lembar Pas)
              </button>
              <button
                type="button"
                onClick={() => setPageDensity('standar')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  pageDensity === 'standar'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tata letak standar dengan ukuran foto lebih besar"
              >
                Standar
              </button>
            </div>

            {/* Scope Selector if multiple reports exist for the day */}
            {allDayReports.length > 1 && (
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/70">
                <button
                  type="button"
                  onClick={() => setPrintScope('single')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    printScope === 'single'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Kegiatan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setPrintScope('full-day')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    printScope === 'full-day'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Semua ({allDayReports.length})
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenEditKop && (
              <button
                type="button"
                onClick={onOpenEditKop}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-medium transition-colors border border-amber-500/30"
                title="Ganti / Edit Logo Kop Surat dan Teks Instansi"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Edit Logo & Kop</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Cetak / Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-900/30 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-1"
              aria-label="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
          {/* Printable Document (Exact A4 210mm x 297mm Government Standard) */}
          <div
            id="printable-document"
            ref={documentRef}
            className="font-[Arial,sans-serif]"
            style={{
              width: '210mm',
              minHeight: '297mm',
              maxWidth: '100%',
              boxSizing: 'border-box',
              padding: pageDensity === 'kompak' ? '8mm 12mm 8mm 12mm' : '12mm 15mm 12mm 15mm',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: pageDensity === 'kompak' ? '8.5pt' : '9.5pt',
              lineHeight: 1.25,
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.25)',
              border: '1px solid #d1d5db'
            }}
          >
            {/* KOP SURAT KEMENSOS & UNIT KERJA SEKOLAH RAKYAT */}
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
                  {/* LOGO KIRI: UNIT KERJA SEKOLAH RAKYAT */}
                  <td
                    className="kop-logo-kiri"
                    style={{
                      width: '64px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '0 2px'
                    }}
                  >
                    <img
                      src={instansi.logo_kiri || instansi.logo_path}
                      width="58"
                      alt="Logo Unit Kerja Sekolah Rakyat"
                      style={{ maxHeight: '66px', maxWidth: '58px', objectFit: 'contain' }}
                    />
                  </td>

                  {/* TEKS KOP SURAT TENGAH (Kemensos & Sekolah Rakyat Besar Sama, Pusat Pendidikan Lebih Kecil, Sedikit Mepet Logo) */}
                  <td className="kop-teks" style={{ textAlign: 'center', padding: '0 4px' }}>
                    {/* BARIS 1: KEMENTERIAN SOSIAL (BESAR SAMA DENGAN SEKOLAH RAKYAT) */}
                    <div
                      style={{
                        margin: 0,
                        fontSize: kopHeaderFont.mainFontSizeCss,
                        fontWeight: 'bold',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        color: '#000',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2
                      }}
                    >
                      {instansi.nama_instansi_atas}
                    </div>

                    {/* BARIS 2: PUSAT PENDIDIKAN / DINAS / DITJEN (LEBIH KECIL KARENA PANJANG) */}
                    <div
                      style={{
                        margin: '1.5px 0',
                        fontSize: kopHeaderFont.subFontSizeCss,
                        fontWeight: '600',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        color: '#111',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2
                      }}
                    >
                      {instansi.nama_dinas}
                    </div>

                    {/* BARIS 3: SEKOLAH RAKYAT (BESAR SAMA DENGAN KEMENTERIAN SOSIAL) */}
                    <div
                      style={{
                        margin: '1.5px 0 2px 0',
                        fontSize: kopHeaderFont.mainFontSizeCss,
                        fontWeight: 'bold',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        color: '#000',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2
                      }}
                    >
                      {instansi.nama_unit_kerja || 'SEKOLAH RAKYAT'}
                    </div>

                    {/* BARU ALAMAT (Diberi space aman dari garis pemisah) */}
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: pageDensity === 'kompak' ? '8pt' : '8.5pt',
                        lineHeight: 1.3,
                        color: '#333'
                      }}
                    >
                      {instansi.alamat_instansi}
                    </p>
                  </td>

                  {/* LOGO KANAN: KEMENTERIAN SOSIAL REPUBLIK INDONESIA */}
                  <td
                    className="kop-logo-kanan"
                    style={{
                      width: '64px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '0 2px'
                    }}
                  >
                    <img
                      src={instansi.logo_kanan || instansi.logo_path}
                      width="58"
                      alt="Logo Kementerian Sosial RI"
                      style={{ maxHeight: '66px', maxWidth: '58px', objectFit: 'contain' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* GARIS GANDA PEMISAH KOP SURAT (Diberi jarak aman agar garis tidak menimpa teks alamat saat cetak/unduh PDF) */}
            <div
              className="kop-divider"
              style={{
                borderBottom: '2.5px double #000',
                marginTop: pageDensity === 'kompak' ? '5px' : '8px',
                marginBottom: pageDensity === 'kompak' ? '8px' : '12px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            />

            {/* JUDUL DOKUMEN */}
            <div
              className="judul"
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                margin: pageDensity === 'kompak' ? '6px 0 8px 0' : '10px 0 12px 0',
                textDecoration: 'underline',
                fontSize: pageDensity === 'kompak' ? '11pt' : '11.5pt',
                letterSpacing: '0.4px',
                color: '#000',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              LAPORAN HASIL KINERJA HARIAN
            </div>

            {/* IDENTITAS PEGAWAI */}
            <table
              className="biodata-table"
              style={{
                width: '100%',
                fontSize: pageDensity === 'kompak' ? '8.5pt' : '9pt',
                marginBottom: pageDensity === 'kompak' ? '8px' : '12px',
                borderCollapse: 'collapse',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <tbody>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ width: '22%', padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>Nama Pegawai</td>
                  <td style={{ width: '2%', padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>:</td>
                  <td style={{ fontWeight: 'bold', padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>
                    {pegawai.nama}
                  </td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>NIP</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>:</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>{pegawai.nip}</td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>Pangkat / Golongan</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>:</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>{pegawai.pangkat_gol}</td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>Jabatan / Unit Kerja</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>:</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>
                    {pegawai.jabatan} / {pegawai.unit_kerja}
                  </td>
                </tr>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>Hari, Tanggal</td>
                  <td style={{ padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>:</td>
                  <td style={{ fontWeight: 'bold', padding: pageDensity === 'kompak' ? '1.5px 0' : '2.5px 0' }}>
                    {formatDateIndonesian(currentReport.tanggal)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TABEL KEGIATAN */}
            <div
              className="sub-judul"
              style={{
                fontWeight: 'bold',
                fontSize: pageDensity === 'kompak' ? '9pt' : '9.5pt',
                margin: pageDensity === 'kompak' ? '8px 0 5px 0' : '12px 0 7px 0',
                textTransform: 'uppercase',
                color: '#000',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              A. Rincian Kegiatan
            </div>
            <table
              className="kegiatan-table"
              style={{
                width: '100%',
                fontSize: pageDensity === 'kompak' ? '8.5pt' : '9pt',
                marginBottom: pageDensity === 'kompak' ? '10px' : '14px',
                borderCollapse: 'collapse',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#eeeeee', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <th
                    style={{
                      border: '1px solid #000',
                      padding: pageDensity === 'kompak' ? '5px 5px' : '6px 6px',
                      width: '6%',
                      textAlign: 'center'
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      border: '1px solid #000',
                      padding: pageDensity === 'kompak' ? '5px 6px' : '6px 7px',
                      width: '18%',
                      textAlign: 'center'
                    }}
                  >
                    Waktu
                  </th>
                  <th
                    style={{
                      border: '1px solid #000',
                      padding: pageDensity === 'kompak' ? '5px 8px' : '6px 9px',
                      width: '44%',
                      textAlign: 'center'
                    }}
                  >
                    Uraian Kegiatan
                  </th>
                  <th
                    style={{
                      border: '1px solid #000',
                      padding: pageDensity === 'kompak' ? '5px 6px' : '6px 7px',
                      width: '16%',
                      textAlign: 'center'
                    }}
                  >
                    Output
                  </th>
                  <th
                    style={{
                      border: '1px solid #000',
                      padding: pageDensity === 'kompak' ? '5px 6px' : '6px 7px',
                      width: '16%',
                      textAlign: 'center'
                    }}
                  >
                    Ket.
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportsToRender.map((rep, idx) => (
                  <tr key={rep.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <td
                      style={{
                        border: '1px solid #000',
                        padding: pageDensity === 'kompak' ? '5px 5px' : '6px 6px',
                        textAlign: 'center',
                        verticalAlign: 'top'
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        border: '1px solid #000',
                        padding: pageDensity === 'kompak' ? '5px 6px' : '6px 7px',
                        textAlign: 'center',
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {rep.jam_mulai} - {rep.jam_selesai}
                    </td>
                    <td
                      style={{
                        border: '1px solid #000',
                        padding: pageDensity === 'kompak' ? '5px 8px' : '6px 9px',
                        verticalAlign: 'top',
                        textAlign: 'justify'
                      }}
                    >
                      <div style={{ fontWeight: '500', lineHeight: 1.35 }}>
                        {rep.uraian_kegiatan}
                      </div>
                      {rep.kategori_skp && (
                        <div
                          style={{
                            fontSize: '7.5pt',
                            color: '#1e3a8a',
                            marginTop: '4px',
                            fontWeight: 'bold',
                            fontStyle: 'normal'
                          }}
                        >
                          Rencana Kinerja (RKP): {rep.kategori_skp}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        border: '1px solid #000',
                        padding: pageDensity === 'kompak' ? '5px 6px' : '6px 7px',
                        textAlign: 'center',
                        verticalAlign: 'top'
                      }}
                    >
                      {rep.volume} {rep.satuan}
                    </td>
                    <td
                      style={{
                        border: '1px solid #000',
                        padding: pageDensity === 'kompak' ? '5px 6px' : '6px 7px',
                        verticalAlign: 'top',
                        fontSize: pageDensity === 'kompak' ? '8pt' : '8.5pt'
                      }}
                    >
                      {rep.keterangan || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* AREA BUKTI DUKUNG / DOKUMENTASI KEGIATAN */}
            <div
              className="sub-judul"
              style={{
                fontWeight: 'bold',
                fontSize: pageDensity === 'kompak' ? '9pt' : '9.5pt',
                margin: pageDensity === 'kompak' ? '8px 0 5px 0' : '12px 0 7px 0',
                textTransform: 'uppercase',
                color: '#000',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              B. Bukti Dukung / Dokumentasi Kegiatan
            </div>

            {allPhotos.length === 0 ? (
              <div
                style={{
                  border: '1px dashed #999',
                  padding: pageDensity === 'kompak' ? '8px' : '12px',
                  textAlign: 'center',
                  fontSize: '8pt',
                  color: '#666',
                  fontStyle: 'italic',
                  marginBottom: pageDensity === 'kompak' ? '8px' : '12px',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                (Tidak ada bukti fisik foto yang dilampirkan)
              </div>
            ) : (
              <table
                className="foto-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: pageDensity === 'kompak' ? '10px' : '14px',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <tbody>
                  {photoRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      {row.map((foto, fIdx) => (
                        <td
                          key={foto.id || fIdx}
                          className="foto-box"
                          style={{
                            width: '50%',
                            border: '1px solid #bbb',
                            padding: pageDensity === 'kompak' ? '5px 7px' : '7px 9px',
                            textAlign: 'center',
                            verticalAlign: 'top',
                            backgroundColor: '#fafafa',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid'
                          }}
                        >
                          <div
                            style={{
                              height: pageDensity === 'kompak' ? '106px' : '138px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f1f1f1',
                              border: '1px solid #ddd',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              className="foto-img"
                              src={foto.file_path}
                              alt={foto.deskripsi_foto || 'Dokumentasi'}
                              style={{
                                maxWidth: '98%',
                                maxHeight: pageDensity === 'kompak' ? '100px' : '132px',
                                objectFit: 'contain'
                              }}
                            />
                          </div>
                          <div
                            className="foto-caption"
                            style={{
                              fontSize: pageDensity === 'kompak' ? '7.5pt' : '8pt',
                              color: '#222',
                              marginTop: '4px',
                              fontStyle: 'italic',
                              lineHeight: 1.3
                            }}
                          >
                            {foto.kegiatanLabel && (
                              <strong style={{ display: 'block', fontSize: '7pt', color: '#1e3a8a', marginBottom: '1px' }}>
                                [{foto.kegiatanLabel}]
                              </strong>
                            )}
                            {foto.deskripsi_foto || 'Dokumentasi Kegiatan'}
                          </div>
                        </td>
                      ))}
                      {/* Empty cell to balance row if odd number of photos */}
                      {row.length === 1 && (
                        <td
                          className="foto-box"
                          style={{
                            width: '50%',
                            border: '1px dashed #ddd',
                            padding: pageDensity === 'kompak' ? '5px 7px' : '7px 9px',
                            backgroundColor: '#fff',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid'
                          }}
                        />
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TANDA TANGAN PEGAWAI (Rata Kanan) */}
            <table
              className="ttd-table area-tanda-tangan"
              style={{
                width: '100%',
                marginTop: pageDensity === 'kompak' ? '10px' : '18px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <tbody>
                <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ width: '55%', pageBreakInside: 'avoid', breakInside: 'avoid' }}></td>
                  <td
                    style={{
                      width: '45%',
                      textAlign: 'center',
                      fontSize: pageDensity === 'kompak' ? '8.5pt' : '9.5pt',
                      verticalAlign: 'top',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid'
                    }}
                  >
                    {instansi.kota_tanda_tangan},{' '}
                    {formatDateIndonesian(currentReport.tanggal)}
                    <br />
                    Pegawai yang Bersangkutan,
                    <div style={{ height: pageDensity === 'kompak' ? '32px' : '44px' }}></div>
                    <u>
                      <strong>{pegawai.nama}</strong>
                    </u>
                    <br />
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
