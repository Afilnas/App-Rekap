import React, { useState } from 'react';
import { LampiranBukti, LaporanRKP } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Clock,
  Maximize2
} from 'lucide-react';
import { formatDateIndonesian, formatFileSize, calculateCompressionSavings } from '../utils/reportUtils';

interface EvidenceModalProps {
  report: LaporanRKP | null;
  onClose: () => void;
  initialIndex?: number;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  report,
  onClose,
  initialIndex = 0
}) => {
  if (!report || !report.lampiran || report.lampiran.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialIndex, report.lampiran.length - 1)
  );
  const [isZoomed, setIsZoomed] = useState(false);

  const currentPhoto: LampiranBukti = report.lampiran[currentIndex];
  const savings = calculateCompressionSavings(
    currentPhoto.original_size,
    currentPhoto.compressed_size
  );

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % report.lampiran.length);
    setIsZoomed(false);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + report.lampiran.length) % report.lampiran.length
    );
    setIsZoomed(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPhoto.file_path;
    link.download = `bukti-dukung-${report.tanggal}-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">
                  Bukti Dukung / Dokumentasi Fisik Kegiatan
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {currentIndex + 1} dari {report.lampiran.length} Foto
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {formatDateIndonesian(report.tanggal)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {report.jam_mulai} - {report.jam_selesai}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Unduh Gambar Asli"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[55vh] overflow-hidden p-4 group select-none">
          <img
            src={currentPhoto.file_path}
            alt={currentPhoto.deskripsi_foto || 'Dokumentasi kegiatan'}
            className={`max-w-full max-h-[50vh] object-contain rounded-lg transition-transform duration-300 ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Navigation Controls */}
          {report.lampiran.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white shadow-lg border border-slate-700 backdrop-blur-sm transition-all"
                aria-label="Foto Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white shadow-lg border border-slate-700 backdrop-blur-sm transition-all"
                aria-label="Foto Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute bottom-3 right-3 text-xs bg-slate-900/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <Maximize2 className="w-3 h-3" />
            <span>{isZoomed ? 'Perkecil' : 'Klik untuk Memperbesar'}</span>
          </button>
        </div>

        {/* Caption & Metadata Section */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Deskripsi / Keterangan Bukti:
              </span>
              <p className="text-white text-sm font-medium italic">
                "{currentPhoto.deskripsi_foto || 'Dokumentasi Kegiatan'}"
              </p>
              <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                <span className="text-slate-500">Kegiatan:</span> {report.uraian_kegiatan}
              </p>
            </div>

            {/* Compression Info Badge */}
            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terkompresi Cepat (WebP/JPEG)</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                {currentPhoto.original_size && (
                  <span>
                    Asli: <strong className="text-slate-300">{formatFileSize(currentPhoto.original_size)}</strong>
                  </span>
                )}
                {currentPhoto.compressed_size && (
                  <>
                    <span>➔</span>
                    <span className="text-emerald-300 font-semibold">
                      {formatFileSize(currentPhoto.compressed_size)}
                    </span>
                  </>
                )}
                {savings > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    -{savings}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnails row if multiple photos */}
          {report.lampiran.length > 1 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1">
              {report.lampiran.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    currentIndex === idx
                      ? 'border-blue-500 shadow-md ring-2 ring-blue-500/30'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.file_path}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[9px] text-white px-1 rounded font-mono">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
