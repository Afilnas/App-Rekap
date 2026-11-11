/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LaporanRKP, InstansiSetting, UserPegawai, ViewTab, ItemRKP } from './types';
import { DEFAULT_INSTANSI, DEFAULT_PEGAWAI, INITIAL_REPORTS, DEFAULT_DAFTAR_RKP } from './utils/defaultData';
import { Navbar } from './components/Navbar';
import { EvidenceModal } from './components/EvidenceModal';
import { OfficialPdfPreview } from './components/OfficialPdfPreview';
import { ReportFormModal } from './components/ReportFormModal';
import { SettingsModal } from './components/SettingsModal';
import { MonthlySummaryModal } from './components/MonthlySummaryModal';
import {
  FileText,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Printer,
  Trash2,
  Edit,
  Eye,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Download,
  Building2,
  RefreshCw
} from 'lucide-react';
import {
  formatDateIndonesian,
  calculateDurationMinutes,
  formatDuration,
  aggregateStatistics,
  filterReports
} from './utils/reportUtils';

export default function App() {
  // Persistent State
  const [reports, setReports] = useState<LaporanRKP[]>(() => {
    try {
      const saved = localStorage.getItem('e_rkp_asn_reports_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REPORTS;
  });

  const [instansi, setInstansi] = useState<InstansiSetting>(() => {
    try {
      const saved = localStorage.getItem('e_rkp_asn_instansi_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_INSTANSI;
  });

  const [pegawai, setPegawai] = useState<UserPegawai>(() => {
    try {
      const saved = localStorage.getItem('e_rkp_asn_pegawai_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PEGAWAI;
  });

  const [daftarRkp, setDaftarRkp] = useState<ItemRKP[]>(() => {
    try {
      const saved = localStorage.getItem('e_rkp_asn_master_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DAFTAR_RKP;
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('e_rkp_asn_reports_v4', JSON.stringify(reports));
    } catch (e) {
      console.error('Gagal menyimpan laporan:', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('e_rkp_asn_instansi_v4', JSON.stringify(instansi));
    } catch (e) {
      console.error('Gagal menyimpan instansi:', e);
    }
  }, [instansi]);

  useEffect(() => {
    try {
      localStorage.setItem('e_rkp_asn_pegawai_v4', JSON.stringify(pegawai));
    } catch (e) {
      console.error('Gagal menyimpan pegawai:', e);
    }
  }, [pegawai]);

  useEffect(() => {
    try {
      localStorage.setItem('e_rkp_asn_master_v4', JSON.stringify(daftarRkp));
    } catch (e) {
      console.error('Gagal menyimpan master RKP:', e);
    }
  }, [daftarRkp]);

  // View state
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LaporanRKP | null>(null);
  const [previewReport, setPreviewReport] = useState<LaporanRKP | null>(null);
  const [evidenceReport, setEvidenceReport] = useState<LaporanRKP | null>(null);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'instansi' | 'rkp' | 'pegawai'>('instansi');
  const [isRekapOpen, setIsRekapOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Statistics
  const stats = aggregateStatistics(reports);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReports = reports.filter((r) => r.tanggal === todayStr);

  // Filtered reports list
  const filteredReports = filterReports(reports, {
    search: searchQuery,
    date: filterDate || undefined,
    month: filterMonth || undefined,
    status: filterStatus !== 'Semua' ? filterStatus : undefined
  }).sort((a, b) => {
    // Sort by date descending, then time descending
    if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
    return b.jam_mulai.localeCompare(a.jam_mulai);
  });

  // Handlers for Save Report
  const handleSaveReport = (
    reportData: Omit<LaporanRKP, 'id' | 'created_at' | 'updated_at'>,
    existingId?: string
  ) => {
    const nowIso = new Date().toISOString();

    if (existingId) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === existingId
            ? {
                ...r,
                ...reportData,
                updated_at: nowIso
              }
            : r
        )
      );
    } else {
      const newReport: LaporanRKP = {
        ...reportData,
        id: `rkp-${Date.now()}`,
        created_at: nowIso,
        updated_at: nowIso
      };
      setReports((prev) => [newReport, ...prev]);
    }
  };

  // Handler for Deleting Report (also purges associated photos to save storage as instructed)
  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirmId(null);
  };

  const handleResetData = () => {
    setReports(INITIAL_REPORTS);
    setInstansi(DEFAULT_INSTANSI);
    setPegawai(DEFAULT_PEGAWAI);
    setDaftarRkp(DEFAULT_DAFTAR_RKP);
    localStorage.removeItem('e_rkp_asn_reports_v2');
    localStorage.removeItem('e_rkp_asn_instansi_v2');
    localStorage.removeItem('e_rkp_asn_pegawai_v2');
    localStorage.removeItem('e_rkp_asn_master_v3');
    localStorage.removeItem('e_rkp_asn_reports_v4');
    localStorage.removeItem('e_rkp_asn_instansi_v4');
    localStorage.removeItem('e_rkp_asn_pegawai_v4');
    localStorage.removeItem('e_rkp_asn_master_v4');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top ASN Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        instansi={instansi}
        pegawai={pegawai}
        onOpenNewReport={() => {
          setEditingReport(null);
          setIsFormOpen(true);
        }}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab || 'instansi');
          setIsSettingsOpen(true);
        }}
        onOpenRekap={() => setIsRekapOpen(true)}
        todayReportsCount={todayReports.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Info Pegawai Aktif */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-900/40 shrink-0">
              {pegawai.nama.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {pegawai.nama}
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  NIP: {pegawai.nip}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {pegawai.jabatan} • {pegawai.unit_kerja} • {pegawai.pangkat_gol}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setSettingsInitialTab('instansi');
                setIsSettingsOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
              title="Edit Logo Kiri/Kanan & Teks Kop Surat"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Kop & Logo: {instansi.nama_dinas.substring(0, 24)}...</span>
            </button>
            <button
              onClick={handleResetData}
              title="Reset ke Contoh Laporan Standar"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Stat 1: Total Kegiatan */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Laporan RKP</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {stats.totalLaporan}
            </div>
            <span className="text-[11px] text-blue-400 font-medium">
              Kegiatan tercatat di sistem
            </span>
          </div>

          {/* Stat 2: Total Durasi */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Jam Kinerja</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
              {stats.totalJamFormatted}
            </div>
            <span className="text-[11px] text-indigo-400 font-medium">
              Akumulasi jam kerja harian
            </span>
          </div>

          {/* Stat 3: Bukti Fisik Terlampir */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Bukti Foto Terlampir</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight flex items-center gap-2">
              <span>{stats.totalBukti}</span>
              <span className="text-xs font-normal text-slate-400">Foto</span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              Kompresi Otomatis Aktif
            </span>
          </div>

          {/* Stat 4: Opsi Dropdown RKP Master */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Dropdown RKP Aktif</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{daftarRkp.length}</span>
              <span className="text-xs font-normal text-slate-400">Pilihan RKP</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium truncate block text-left mt-0.5"
            >
              Kelola di Pengaturan ➔
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari uraian kegiatan, output, atau keterangan foto bukti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>

            {/* Date, Month, Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Date */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none"
                  title="Filter Berdasarkan Tanggal Spesifik"
                />
              </div>

              {/* Filter Month */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none"
                  title="Filter Berdasarkan Bulan"
                />
              </div>

              {/* Status Select */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="Semua">Semua Status</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              </select>

              {(searchQuery || filterDate || filterMonth || filterStatus !== 'Semua') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterDate('');
                    setFilterMonth('');
                    setFilterStatus('Semua');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table of Reports (Riwayat Laporan RKP) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-sm sm:text-base text-white">
                Daftar Riwayat Laporan Hasil Kinerja Harian (RKP)
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {filteredReports.length} Data
              </span>
            </div>

            <button
              onClick={() => {
                setEditingReport(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Laporan Baru</span>
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white text-sm">
                Belum ada laporan kegiatan yang sesuai
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan buat laporan baru atau sesuaikan filter pencarian di atas.
              </p>
              <button
                onClick={() => {
                  setEditingReport(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Laporan Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-40">Tanggal & Waktu</th>
                    <th className="py-3 px-4">Uraian Kegiatan & SKP</th>
                    <th className="py-3 px-4 w-28 text-center">Output</th>
                    <th className="py-3 px-4 w-48 text-center">
                      Bukti Dukung (Foto)
                    </th>
                    <th className="py-3 px-4 w-32 text-center">Status</th>
                    <th className="py-3 px-4 w-36 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredReports.map((report, index) => {
                    const durationMins = calculateDurationMinutes(
                      report.jam_mulai,
                      report.jam_selesai
                    );
                    const photoCount = report.lampiran ? report.lampiran.length : 0;
                    const sameDayReports = reports.filter((r) => r.tanggal === report.tanggal);

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {index + 1}
                        </td>

                        {/* Tanggal & Waktu */}
                        <td className="py-3 px-4 text-slate-300">
                          <div className="font-semibold text-white">
                            {formatDateIndonesian(report.tanggal)}
                          </div>
                          <div className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {report.jam_mulai} - {report.jam_selesai} ({formatDuration(durationMins)})
                            </span>
                          </div>
                        </td>

                        {/* Uraian Kegiatan */}
                        <td className="py-3 px-4 text-slate-200">
                          <p className="font-medium text-white line-clamp-2 leading-relaxed">
                            {report.uraian_kegiatan}
                          </p>
                          {report.kategori_skp && (
                            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {report.kategori_skp}
                            </span>
                          )}
                          {report.catatan_atasan && (
                            <p className="text-[11px] text-emerald-400/90 mt-1 italic">
                              Catatan Atasan: "{report.catatan_atasan}"
                            </p>
                          )}
                        </td>

                        {/* Output */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-white">
                            {report.volume}
                          </span>{' '}
                          <span className="text-xs text-slate-400">
                            {report.satuan}
                          </span>
                        </td>

                        {/* Bukti Dukung (Special Feature Requested in Prompt!) */}
                        <td className="py-3 px-4 text-center">
                          {photoCount > 0 ? (
                            <div className="flex flex-col items-center gap-1.5">
                              {/* Mini Thumbnails Row */}
                              <div className="flex items-center justify-center -space-x-2 overflow-hidden py-1">
                                {report.lampiran.slice(0, 3).map((item, pIdx) => (
                                  <button
                                    key={item.id || pIdx}
                                    type="button"
                                    onClick={() => {
                                      setEvidenceReport(report);
                                      setEvidenceIndex(pIdx);
                                    }}
                                    className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800 transition-transform hover:scale-110 hover:z-10 focus:outline-none"
                                    title={item.deskripsi_foto || 'Klik untuk melihat foto'}
                                  >
                                    <img
                                      src={item.file_path}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                              </div>

                              {/* Button "Lihat Bukti Foto" */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEvidenceReport(report);
                                  setEvidenceIndex(0);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors border border-blue-500/30"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat {photoCount} Foto</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              Tidak ada foto
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              report.status_verifikasi === 'Disetujui'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{report.status_verifikasi}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Cetak / Ekspor PDF */}
                            <button
                              type="button"
                              onClick={() => setPreviewReport(report)}
                              title="Cetak Dokumen / Ekspor PDF Resmi ASN"
                              className="p-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReport(report);
                                setIsFormOpen(true);
                              }}
                              title="Edit Laporan"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(report.id)}
                              title="Hapus Laporan & Bukti"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">
                Konfirmasi Penghapusan Laporan
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan ini? Sesuai standar manajemen penyimpanan, seluruh berkas foto bukti fisik yang terkait akan dihapus secara permanen dari penyimpanan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReport(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors shadow-md shadow-red-950/40"
              >
                Ya, Hapus Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input / Edit Form Modal */}
      {isFormOpen && (
        <ReportFormModal
          initialReport={editingReport}
          daftarRkp={daftarRkp}
          onOpenSettings={() => {
            setIsFormOpen(false);
            setIsSettingsOpen(true);
          }}
          onSave={handleSaveReport}
          onClose={() => {
            setIsFormOpen(false);
            setEditingReport(null);
          }}
        />
      )}

      {/* Evidence Photo Lightbox Modal */}
      {evidenceReport && (
        <EvidenceModal
          report={evidenceReport}
          initialIndex={evidenceIndex}
          onClose={() => setEvidenceReport(null)}
        />
      )}

      {/* Official PDF / Print Preview Modal */}
      {previewReport && (
        <OfficialPdfPreview
          currentReport={previewReport}
          allDayReports={reports.filter((r) => r.tanggal === previewReport.tanggal)}
          instansi={instansi}
          pegawai={pegawai}
          onOpenEditKop={() => {
            setSettingsInitialTab('instansi');
            setIsSettingsOpen(true);
          }}
          onClose={() => setPreviewReport(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          instansi={instansi}
          pegawai={pegawai}
          daftarRkp={daftarRkp}
          initialTab={settingsInitialTab}
          onSave={(newInstansi, newPegawai, newRkp) => {
            setInstansi(newInstansi);
            setPegawai(newPegawai);
            setDaftarRkp(newRkp);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Monthly Summary Modal */}
      {isRekapOpen && (
        <MonthlySummaryModal
          reports={reports}
          instansi={instansi}
          pegawai={pegawai}
          onClose={() => setIsRekapOpen(false)}
        />
      )}
    </div>
  );
}
