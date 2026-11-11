import React, { useState, useRef } from 'react';
import { LampiranBukti, LaporanRKP, ItemRKP } from '../types';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Info,
  Clock,
  Calendar,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  ListTodo
} from 'lucide-react';
import { compressImage } from '../utils/imageCompression';
import { formatFileSize, calculateDurationMinutes, formatDuration } from '../utils/reportUtils';

interface ReportFormModalProps {
  initialReport?: LaporanRKP | null;
  daftarRkp?: ItemRKP[];
  onOpenSettings?: () => void;
  onSave: (report: Omit<LaporanRKP, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => void;
  onClose: () => void;
}

interface UploadedPhotoDraft {
  tempId: string;
  file_path: string;
  deskripsi_foto: string;
  original_size: number;
  compressed_size: number;
  savingsPercent: number;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  initialReport,
  daftarRkp = [],
  onOpenSettings,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialReport);

  const [tanggal, setTanggal] = useState(
    initialReport ? initialReport.tanggal : new Date().toISOString().split('T')[0]
  );
  const [jamMulai, setJamMulai] = useState(initialReport ? initialReport.jam_mulai : '08:00');
  const [jamSelesai, setJamSelesai] = useState(initialReport ? initialReport.jam_selesai : '10:00');
  const [uraianKegiatan, setUraianKegiatan] = useState(
    initialReport ? initialReport.uraian_kegiatan : ''
  );
  const [volume, setVolume] = useState<number>(initialReport ? initialReport.volume : 1);
  const [satuan, setSatuan] = useState(initialReport ? initialReport.satuan : 'Dokumen');
  const [keterangan, setKeterangan] = useState(
    initialReport ? initialReport.keterangan : 'Selesai 100%'
  );

  // Initialize selected RKP from daftarRkp
  const initialRkp = initialReport?.rkp_id
    ? daftarRkp.find((r) => r.id === initialReport.rkp_id)
    : initialReport?.kategori_skp
    ? daftarRkp.find((r) => r.nama === initialReport.kategori_skp) || daftarRkp[0]
    : daftarRkp[0];

  const [selectedRkpId, setSelectedRkpId] = useState<string>(
    initialRkp ? initialRkp.id : ''
  );
  const [kategoriSkp, setKategoriSkp] = useState<string>(
    initialRkp ? initialRkp.nama : initialReport?.kategori_skp || ''
  );

  // Photos draft list
  const [photos, setPhotos] = useState<UploadedPhotoDraft[]>(
    initialReport?.lampiran?.map((l) => ({
      tempId: l.id,
      file_path: l.file_path,
      deskripsi_foto: l.deskripsi_foto || '',
      original_size: l.original_size || 500000,
      compressed_size: l.compressed_size || 180000,
      savingsPercent: l.original_size && l.compressed_size
        ? Math.round(((l.original_size - l.compressed_size) / l.original_size) * 100)
        : 65
    })) || []
  );

  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const durationMinutes = calculateDurationMinutes(jamMulai, jamSelesai);

  // Handle file uploads with automated compression
  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);

    if (photos.length + fileArray.length > 4) {
      setErrorMessage('Maksimal 4 foto dokumentasi per satu laporan kegiatan.');
      return;
    }

    setIsCompressing(true);

    try {
      const newDrafts: UploadedPhotoDraft[] = [];

      for (const file of fileArray) {
        // Validate MIME type
        if (!file.type.startsWith('image/')) {
          setErrorMessage(`File "${file.name}" bukan format gambar yang valid.`);
          continue;
        }

        // Validate max initial size (allow up to 15MB since compression will shrink it)
        if (file.size > 15 * 1024 * 1024) {
          setErrorMessage(`Ukuran file "${file.name}" melebihi batas 15MB.`);
          continue;
        }

        // Automatic smart compression: max 950px, quality 0.75
        const compressed = await compressImage(file, 950, 950, 0.75);

        newDrafts.push({
          tempId: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file_path: compressed.dataUrl,
          deskripsi_foto: `Dokumentasi ${file.name.replace(/\.[^/.]+$/, '')}`,
          original_size: compressed.originalSize,
          compressed_size: compressed.compressedSize,
          savingsPercent: compressed.savingsPercent
        });
      }

      setPhotos((prev) => [...prev, ...newDrafts]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input
    e.target.value = '';
  };

  const handleRemovePhoto = (tempId: string) => {
    setPhotos((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  const handleUpdateCaption = (tempId: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.tempId === tempId ? { ...p, deskripsi_foto: caption } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraianKegiatan.trim()) {
      setErrorMessage('Uraian kegiatan wajib diisi.');
      return;
    }

    const lampiranResult: LampiranBukti[] = photos.map((p, idx) => ({
      id: p.tempId.startsWith('draft-') ? `buk-${Date.now()}-${idx}` : p.tempId,
      laporan_id: initialReport ? initialReport.id : '',
      file_path: p.file_path,
      deskripsi_foto: p.deskripsi_foto.trim() || 'Dokumentasi Kegiatan',
      original_size: p.original_size,
      compressed_size: p.compressed_size,
      created_at: new Date().toISOString()
    }));

    onSave(
      {
        tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        uraian_kegiatan: uraianKegiatan.trim(),
        volume: Number(volume) || 1,
        satuan,
        keterangan: keterangan.trim(),
        rkp_id: selectedRkpId,
        kategori_skp: kategoriSkp,
        lampiran: lampiranResult,
        status_verifikasi: initialReport ? initialReport.status_verifikasi : 'Disetujui',
        catatan_atasan: initialReport?.catatan_atasan
      },
      initialReport?.id
    );

    onClose();
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? 'Perbarui Laporan Kinerja RKP' : 'Input Laporan Hasil Kinerja Harian'}
              </h3>
              <p className="text-xs text-slate-400">
                Lengkapi rincian tugas ASN beserta lampiran bukti dukung visual
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Waktu & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Jam Mulai
              </label>
              <input
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Jam Selesai
              </label>
              <input
                type="time"
                required
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-blue-400 font-mono mt-1 inline-block">
                Durasi: {formatDuration(durationMinutes)}
              </span>
            </div>
          </div>

          {/* Section 2: Uraian Kegiatan & Dropdown RKP */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rencana Kinerja Pegawai (Dropdown RKP)</span>
                </label>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <span>+ Kelola Opsi RKP di Pengaturan</span>
                  </button>
                )}
              </div>
              <select
                value={selectedRkpId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRkpId(val);
                  const found = daftarRkp.find((r) => r.id === val);
                  if (found) {
                    setKategoriSkp(found.nama);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 leading-normal"
              >
                {daftarRkp.length > 0 ? (
                  daftarRkp.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.kode}] {item.nama}
                    </option>
                  ))
                ) : (
                  <option value="">Belum ada RKP, silakan input di Pengaturan</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Uraian Kegiatan Harian (Wajib)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Contoh: Memimpin rapat pembahasan SOP penanganan insiden siber bersama Tim CSIRT dan OPD terkait..."
                value={uraianKegiatan}
                onChange={(e) => setUraianKegiatan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500 leading-relaxed"
              />
            </div>

            {/* Volume, Satuan, Keterangan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Volume / Kuantitas
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={volume}
                  onChange={(e) => setVolume(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Satuan Output
                </label>
                <select
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Dokumen">Dokumen</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Paket">Paket</option>
                  <option value="Peserta">Peserta</option>
                  <option value="Modul/Fitur">Modul/Fitur</option>
                  <option value="Rekomendasi">Rekomendasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Keterangan Progres
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Selesai 100%, Diteruskan ke Pimpinan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Unggah Bukti Dukung / Dokumentasi Foto (Crucial Feature Requested) */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Lampiran Bukti Dukung / Foto Kegiatan
                </h4>
                <p className="text-xs text-slate-400">
                  Maksimal 4 foto per kegiatan. Foto otomatis di-resize (800-1000px) & dikompresi agar PDF cepat & ringan.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {photos.length} / 4 Foto
              </span>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Drag & Drop Trigger */}
            {photos.length < 4 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    processFiles(e.dataTransfer.files);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/40'
                }`}
              >
                {isCompressing ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2 text-blue-400">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="text-xs font-medium">
                      Mengompresi gambar otomatis (Target: 800-1000px, 75% kualitas)...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Pilih Foto dari Galeri / Berkas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Ambil Foto Langsung (Kamera)</span>
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-2">
                  Mendukung JPG, JPEG, PNG. File smartphone besar (3-10MB) akan otomatis dioptimalkan ke ~150-250KB tanpa kehilangan detail.
                </p>
              </div>
            )}

            {/* List of Uploaded Photos with Preview & Caption Inputs */}
            {photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((item, index) => (
                  <div
                    key={item.tempId}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 relative group"
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail with overlay badge */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/60 border border-slate-700 shrink-0 relative flex items-center justify-center">
                        <img
                          src={item.file_path}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 text-[10px] text-white px-1.5 py-0.2 rounded font-mono">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Info & Caption Input */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {item.savingsPercent > 0
                              ? `Hemat ${item.savingsPercent}%`
                              : 'Terkendali'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(item.tempId)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Hapus Foto Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{formatFileSize(item.original_size)}</span>
                          <span>➔</span>
                          <strong className="text-emerald-300">
                            {formatFileSize(item.compressed_size)}
                          </strong>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-medium mb-1">
                            Keterangan / Caption Foto (Wajib untuk PDF):
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Foto saat memimpin rapat pembahasan SOP"
                            value={item.deskripsi_foto}
                            onChange={(e) =>
                              handleUpdateCaption(item.tempId, e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer / Save Actions */}
          <div className="border-t border-slate-800 pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Laporan & Bukti'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
