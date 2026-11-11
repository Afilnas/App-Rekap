import React, { useState, useRef } from 'react';
import { InstansiSetting, UserPegawai, ItemRKP } from '../types';
import {
  X,
  Settings,
  Building,
  User,
  RotateCcw,
  CheckCircle,
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
  Eye,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import {
  DEFAULT_INSTANSI,
  DEFAULT_PEGAWAI,
  DEFAULT_DAFTAR_RKP,
  LOGO_SEKOLAH_RAKYAT,
  LOGO_KEMENSOS,
  PRESET_LOGOS,
  PresetLogoItem
} from '../utils/defaultData';
import { processLogoFile } from '../utils/imageCompression';
import { getKopSuratHeaderFontSize } from '../utils/reportUtils';

interface SettingsModalProps {
  instansi: InstansiSetting;
  pegawai: UserPegawai;
  daftarRkp: ItemRKP[];
  initialTab?: 'instansi' | 'rkp' | 'pegawai';
  onSave: (instansi: InstansiSetting, pegawai: UserPegawai, daftarRkp: ItemRKP[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  instansi,
  pegawai,
  daftarRkp,
  initialTab = 'instansi',
  onSave,
  onClose
}) => {
  const [instansiForm, setInstansiForm] = useState<InstansiSetting>({ ...instansi });
  const [pegawaiForm, setPegawaiForm] = useState<UserPegawai>({ ...pegawai });
  const [rkpList, setRkpList] = useState<ItemRKP[]>([...daftarRkp]);

  // Scaled equal font size for Kop Surat preview
  const kopPreviewFont = getKopSuratHeaderFontSize(
    instansiForm.nama_instansi_atas || 'NAMA INSTANSI ATAS',
    instansiForm.nama_dinas || 'NAMA DINAS / BADAN',
    instansiForm.nama_unit_kerja || 'NAMA UNIT KERJA',
    'preview'
  );

  const [activeTab, setActiveTab] = useState<'instansi' | 'rkp' | 'pegawai'>(initialTab);

  // Logo editing states
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);
  const [activePresetTarget, setActivePresetTarget] = useState<'kiri' | 'kanan' | null>(null);
  const [urlModalTarget, setUrlModalTarget] = useState<'kiri' | 'kanan' | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingLogo, setIsProcessingLogo] = useState<string | null>(null);
  const [logoFeedback, setLogoFeedback] = useState<string | null>(null);

  const handleLogoUpload = async (target: 'kiri' | 'kanan', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLogo(target);
    try {
      const optimizedDataUrl = await processLogoFile(file);
      if (target === 'kiri') {
        setInstansiForm((prev) => ({ ...prev, logo_kiri: optimizedDataUrl }));
        setLogoFeedback('Logo Kiri berhasil diperbarui!');
      } else {
        setInstansiForm((prev) => ({ ...prev, logo_kanan: optimizedDataUrl, logo_path: optimizedDataUrl }));
        setLogoFeedback('Logo Kanan berhasil diperbarui!');
      }
      setTimeout(() => setLogoFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses berkas logo');
    } finally {
      setIsProcessingLogo(null);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleApplyPreset = (target: 'kiri' | 'kanan', preset: PresetLogoItem) => {
    if (target === 'kiri') {
      setInstansiForm((prev) => ({ ...prev, logo_kiri: preset.src }));
      setLogoFeedback(`Logo Kiri diubah ke: ${preset.nama}`);
    } else {
      setInstansiForm((prev) => ({ ...prev, logo_kanan: preset.src, logo_path: preset.src }));
      setLogoFeedback(`Logo Kanan diubah ke: ${preset.nama}`);
    }
    setActivePresetTarget(null);
    setTimeout(() => setLogoFeedback(null), 3500);
  };

  const handleApplyUrl = (target: 'kiri' | 'kanan') => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (target === 'kiri') {
      setInstansiForm((prev) => ({ ...prev, logo_kiri: trimmed }));
      setLogoFeedback('Tautan URL Logo Kiri berhasil diterapkan!');
    } else {
      setInstansiForm((prev) => ({ ...prev, logo_kanan: trimmed, logo_path: trimmed }));
      setLogoFeedback('Tautan URL Logo Kanan berhasil diterapkan!');
    }
    setUrlModalTarget(null);
    setUrlInput('');
    setTimeout(() => setLogoFeedback(null), 3500);
  };

  const handleResetLogo = (target: 'kiri' | 'kanan') => {
    if (target === 'kiri') {
      setInstansiForm((prev) => ({ ...prev, logo_kiri: LOGO_SEKOLAH_RAKYAT }));
      setLogoFeedback('Logo Kiri dikembalikan ke default Sekolah Rakyat');
    } else {
      setInstansiForm((prev) => ({ ...prev, logo_kanan: LOGO_KEMENSOS, logo_path: LOGO_KEMENSOS }));
      setLogoFeedback('Logo Kanan dikembalikan ke default Kemensos RI');
    }
    setTimeout(() => setLogoFeedback(null), 3500);
  };

  const handleRemoveLogo = (target: 'kiri' | 'kanan') => {
    if (target === 'kiri') {
      setInstansiForm((prev) => ({ ...prev, logo_kiri: '' }));
      setLogoFeedback('Logo Kiri dinonaktifkan (kop surat tanpa logo kiri)');
    } else {
      setInstansiForm((prev) => ({ ...prev, logo_kanan: '' }));
      setLogoFeedback('Logo Kanan dinonaktifkan (kop surat tanpa logo kanan)');
    }
    setTimeout(() => setLogoFeedback(null), 3500);
  };

  // State for adding a new RKP
  const [newKode, setNewKode] = useState(`RKP-0${rkpList.length + 1}`);
  const [newNama, setNewNama] = useState('');
  const [newKeterangan, setNewKeterangan] = useState('');
  const [rkpError, setRkpError] = useState<string | null>(null);

  // State for editing an existing RKP
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKode, setEditKode] = useState('');
  const [editNama, setEditNama] = useState('');

  const handleAddRkp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) {
      setRkpError('Nama Rencana Kinerja (RKP) tidak boleh kosong.');
      return;
    }
    setRkpError(null);
    const newItem: ItemRKP = {
      id: `rkp-${Date.now()}`,
      kode: newKode.trim() || `RKP-0${rkpList.length + 1}`,
      nama: newNama.trim(),
      keterangan: newKeterangan.trim() || undefined
    };
    const updated = [...rkpList, newItem];
    setRkpList(updated);
    setNewKode(`RKP-0${updated.length + 1}`);
    setNewNama('');
    setNewKeterangan('');
  };

  const handleDeleteRkp = (id: string) => {
    if (rkpList.length <= 1) {
      alert('Minimal harus ada 1 Rencana Kinerja (RKP) di dalam sistem.');
      return;
    }
    setRkpList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleStartEdit = (item: ItemRKP) => {
    setEditingId(item.id);
    setEditKode(item.kode);
    setEditNama(item.nama);
  };

  const handleSaveEdit = (id: string) => {
    if (!editNama.trim()) return;
    setRkpList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, kode: editKode.trim() || r.kode, nama: editNama.trim() } : r
      )
    );
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(instansiForm, pegawaiForm, rkpList);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh pengaturan instansi, pegawai, dan daftar RKP ke data awal?')) {
      setInstansiForm(DEFAULT_INSTANSI);
      setPegawaiForm(DEFAULT_PEGAWAI);
      setRkpList(DEFAULT_DAFTAR_RKP);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Pengaturan Sistem & Master Rencana Kinerja (RKP)
              </h3>
              <p className="text-xs text-slate-400">
                Kelola pilihan dropdown RKP, format Kop Surat dinas, dan identitas pegawai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('rkp')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'rkp'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Master Pilihan RKP ({rkpList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instansi')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'instansi'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Kop Instansi / Dinas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pegawai')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pegawai'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Identitas Pegawai</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: MASTER DAFTAR RKP (Crucial User Request) */}
          {activeTab === 'rkp' && (
            <div className="space-y-5">
              <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
                <ListTodo className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    Pilihan Dropdown Rencana Kinerja Pegawai (RKP):
                  </strong>
                  Daftar RKP yang Anda masukkan di sini akan otomatis muncul sebagai opsi pilihan dropdown saat Anda menginput atau mengedit laporan harian RKP.
                </div>
              </div>

              {/* Form Tambah RKP Baru */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  Tambah RKP Baru ke Pilihan Dropdown
                </h4>

                {rkpError && (
                  <div className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{rkpError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Kode RKP
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RKP-06"
                      value={newKode}
                      onChange={(e) => setNewKode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Nama Rencana Kinerja Pegawai (RKP / RHK)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Terlaksananya evaluasi keamanan jaringan dan penanganan insiden siber..."
                        value={newNama}
                        onChange={(e) => setNewNama(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddRkp}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of Existing RKP */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Daftar Pilihan RKP Tersedia ({rkpList.length} RKP):
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {rkpList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                    >
                      {editingId === item.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editKode}
                            onChange={(e) => setEditKode(e.target.value)}
                            className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                          />
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Simpan Perubahan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start gap-2.5 min-w-0">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 shrink-0 mt-0.5">
                            {item.kode}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
                              {item.nama}
                            </p>
                            {item.keterangan && (
                              <span className="text-[10px] text-slate-500">
                                {item.keterangan}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        {editingId !== item.id && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit RKP"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteRkp(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus RKP dari Pilihan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOP SURAT */}
          {activeTab === 'instansi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Instansi Atas (Provinsi / Kabupaten / Kota / Kementerian)
                </label>
                <input
                  type="text"
                  required
                  value={instansiForm.nama_instansi_atas}
                  onChange={(e) =>
                    setInstansiForm({ ...instansiForm, nama_instansi_atas: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Dinas / Badan / Direktorat Jenderal
                </label>
                <input
                  type="text"
                  required
                  value={instansiForm.nama_dinas}
                  onChange={(e) =>
                    setInstansiForm({ ...instansiForm, nama_dinas: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* SETELAH NAMA DINAS TERDAPAT NAMA UNIT KERJA BARU ALAMAT */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1.5">
                  Nama Unit Kerja (Tercetak setelah Nama Dinas, sebelum Alamat)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SEKOLAH RAKYAT"
                  value={instansiForm.nama_unit_kerja || ''}
                  onChange={(e) =>
                    setInstansiForm({ ...instansiForm, nama_unit_kerja: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-500/50 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-bold tracking-wide"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Lengkap Instansi, Telepon & Kontak Resmi
                </label>
                <textarea
                  rows={2}
                  required
                  value={instansiForm.alamat_instansi}
                  onChange={(e) =>
                    setInstansiForm({ ...instansiForm, alamat_instansi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kota Lokasi Penandatanganan Dokumen
                </label>
                <input
                  type="text"
                  required
                  value={instansiForm.kota_tanda_tangan}
                  onChange={(e) =>
                    setInstansiForm({ ...instansiForm, kota_tanda_tangan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* LOGO FEEDBACK NOTIFICATION */}
              {logoFeedback && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{logoFeedback}</span>
                </div>
              )}

              {/* SEKSI EDIT LOGO KOP SURAT */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span>Edit & Kustomisasi Logo Kop Surat</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Unggah berkas logo sendiri (PNG transparan/JPG/SVG) atau pilih dari logo resmi pemerintah
                    </p>
                  </div>
                </div>

                {/* HIDDEN FILE INPUTS */}
                <input
                  type="file"
                  ref={leftFileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => handleLogoUpload('kiri', e)}
                />
                <input
                  type="file"
                  ref={rightFileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => handleLogoUpload('kanan', e)}
                />

                {/* DUA KARTU EDITOR LOGO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* CARD 1: LOGO KIRI (UNIT KERJA) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>LOGO KIRI (Unit Kerja)</span>
                        </span>
                        {instansiForm.logo_kiri ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                            Kosong
                          </span>
                        )}
                      </div>

                      {/* Preview Box */}
                      <div className="h-24 bg-white rounded-lg border border-slate-700/60 p-2 flex items-center justify-center relative overflow-hidden mb-3">
                        {isProcessingLogo === 'kiri' ? (
                          <div className="flex flex-col items-center gap-1 text-slate-600 text-xs">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                            <span>Memproses logo...</span>
                          </div>
                        ) : instansiForm.logo_kiri ? (
                          <img
                            src={instansiForm.logo_kiri}
                            alt="Logo Kiri"
                            className="max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                            <span>Tanpa Logo Kiri</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Logo Kiri */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => leftFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePresetTarget('kiri')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pilih Preset</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            setUrlInput(instansiForm.logo_kiri || '');
                            setUrlModalTarget('kiri');
                          }}
                          className="hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>URL Link</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetLogo('kiri')}
                            className="hover:text-slate-200 transition-colors"
                            title="Kembalikan ke Logo Default Sekolah Rakyat"
                          >
                            Reset Default
                          </button>
                          {instansiForm.logo_kiri && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLogo('kiri')}
                              className="text-rose-400 hover:text-rose-300 transition-colors"
                              title="Hapus Logo Kiri"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: LOGO KANAN (INSTANSI / KEMENTERIAN) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>LOGO KANAN (Kementerian / Dinas)</span>
                        </span>
                        {instansiForm.logo_kanan ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                            Kosong
                          </span>
                        )}
                      </div>

                      {/* Preview Box */}
                      <div className="h-24 bg-white rounded-lg border border-slate-700/60 p-2 flex items-center justify-center relative overflow-hidden mb-3">
                        {isProcessingLogo === 'kanan' ? (
                          <div className="flex flex-col items-center gap-1 text-slate-600 text-xs">
                            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                            <span>Memproses logo...</span>
                          </div>
                        ) : instansiForm.logo_kanan ? (
                          <img
                            src={instansiForm.logo_kanan}
                            alt="Logo Kanan"
                            className="max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                            <span>Tanpa Logo Kanan</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Logo Kanan */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => rightFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePresetTarget('kanan')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pilih Preset</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            setUrlInput(instansiForm.logo_kanan || '');
                            setUrlModalTarget('kanan');
                          }}
                          className="hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>URL Link</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetLogo('kanan')}
                            className="hover:text-slate-200 transition-colors"
                            title="Kembalikan ke Logo Default Kemensos RI"
                          >
                            Reset Default
                          </button>
                          {instansiForm.logo_kanan && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLogo('kanan')}
                              className="text-rose-400 hover:text-rose-300 transition-colors"
                              title="Hapus Logo Kanan"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRATINJAU LANGSUNG KOP SURAT RESMI PADA KERTAS */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hasil Nyata Pratinjau Kop Surat (Standar Cetak ASN)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Otomatis tersinkronisasi saat edit teks atau ganti logo
                    </span>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-slate-300 text-slate-900 font-sans">
                    <table
                      style={{
                        width: '100%',
                        borderBottom: '3px double #000',
                        paddingBottom: '8px',
                        borderCollapse: 'collapse'
                      }}
                    >
                      <tbody>
                        <tr>
                          {/* Logo Kiri */}
                          <td style={{ width: '58px', textAlign: 'center', verticalAlign: 'middle', padding: '0 2px' }}>
                            {instansiForm.logo_kiri ? (
                              <img
                                src={instansiForm.logo_kiri}
                                alt="Logo Kiri"
                                style={{ maxHeight: '55px', maxWidth: '56px', objectFit: 'contain', margin: '0 auto' }}
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', border: '1px dashed #bbb', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#888' }}>
                                (Kiri)
                              </div>
                            )}
                          </td>

                          {/* Teks Kop Surat (Kemensos & Sekolah Rakyat Besar Sama, Pusat Pendidikan Lebih Kecil, Sedikit Mepet Logo) */}
                          <td style={{ textAlign: 'center', padding: '0 3px' }}>
                            <div style={{ fontSize: kopPreviewFont.mainFontSizeCss, fontWeight: 'bold', textTransform: 'uppercase', color: '#000', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                              {instansiForm.nama_instansi_atas || 'NAMA INSTANSI ATAS'}
                            </div>
                            <div style={{ fontSize: kopPreviewFont.subFontSizeCss, fontWeight: '600', textTransform: 'uppercase', color: '#111', margin: '1px 0', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                              {instansiForm.nama_dinas || 'NAMA DINAS / BADAN'}
                            </div>
                            <div style={{ fontSize: kopPreviewFont.mainFontSizeCss, fontWeight: 'bold', textTransform: 'uppercase', color: '#000', letterSpacing: '0.3px', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                              {instansiForm.nama_unit_kerja || 'NAMA UNIT KERJA'}
                            </div>
                            <div style={{ fontSize: '7.5pt', color: '#333', marginTop: '2px', lineHeight: 1.25 }}>
                              {instansiForm.alamat_instansi || 'Alamat instansi'}
                            </div>
                          </td>

                          {/* Logo Kanan */}
                          <td style={{ width: '58px', textAlign: 'center', verticalAlign: 'middle', padding: '0 2px' }}>
                            {instansiForm.logo_kanan ? (
                              <img
                                src={instansiForm.logo_kanan}
                                alt="Logo Kanan"
                                style={{ maxHeight: '55px', maxWidth: '60px', objectFit: 'contain', margin: '0 auto' }}
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', border: '1px dashed #bbb', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#888' }}>
                                (Kanan)
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* MODAL PILIH PRESET LOGO */}
              {activePresetTarget && (
                <div
                  className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
                  onClick={() => setActivePresetTarget(null)}
                >
                  <div
                    className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-5 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Pilih Logo Resmi ({activePresetTarget === 'kiri' ? 'Logo Kiri' : 'Logo Kanan'})</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Pilihan logo vektor tajam berstandar instansi pemerintah
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePresetTarget(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
                      {PRESET_LOGOS.map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => handleApplyPreset(activePresetTarget, preset)}
                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/60 p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                        >
                          <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-700 shadow-sm">
                            <img src={preset.src} alt={preset.nama} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white group-hover:text-blue-400 truncate">
                                {preset.nama}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                              {preset.deskripsi}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActivePresetTarget(null)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL INPUT URL GAMBAR LOGO */}
              {urlModalTarget && (
                <div
                  className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
                  onClick={() => setUrlModalTarget(null)}
                >
                  <div
                    className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-5 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-blue-400" />
                          <span>Masukkan URL Gambar ({urlModalTarget === 'kiri' ? 'Logo Kiri' : 'Logo Kanan'})</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Tautan berkas gambar langsung (format https://...png/jpg)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUrlModalTarget(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <input
                        type="url"
                        placeholder="https://instansi.go.id/logo.png"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {urlInput && (
                      <div className="p-2 bg-white rounded-lg flex items-center justify-center h-20 border border-slate-700">
                        <img src={urlInput} alt="Preview URL" className="max-h-16 object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setUrlModalTarget(null)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyUrl(urlModalTarget)}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Terapkan Logo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IDENTITAS PEGAWAI */}
          {activeTab === 'pegawai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap Pegawai ASN (Beserta Gelar)
                </label>
                <input
                  type="text"
                  required
                  value={pegawaiForm.nama}
                  onChange={(e) =>
                    setPegawaiForm({ ...pegawaiForm, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  NIP Pegawai
                </label>
                <input
                  type="text"
                  required
                  value={pegawaiForm.nip}
                  onChange={(e) =>
                    setPegawaiForm({ ...pegawaiForm, nip: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Jabatan Fungsional / Pelaksana
                </label>
                <input
                  type="text"
                  required
                  value={pegawaiForm.jabatan}
                  onChange={(e) =>
                    setPegawaiForm({ ...pegawaiForm, jabatan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Unit Kerja / Bidang
                  </label>
                  <input
                    type="text"
                    required
                    value={pegawaiForm.unit_kerja}
                    onChange={(e) =>
                      setPegawaiForm({ ...pegawaiForm, unit_kerja: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    type="text"
                    required
                    value={pegawaiForm.pangkat_gol}
                    onChange={(e) =>
                      setPegawaiForm({ ...pegawaiForm, pangkat_gol: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-900/30"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
