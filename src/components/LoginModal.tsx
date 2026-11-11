import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Lock,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { loginWithGoogle, logoutUser, User } from '../firebase';
import { InstansiSetting, UserPegawai } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  pegawai: UserPegawai;
  instansi: InstansiSetting;
  onLoginSuccess?: (user: User) => void;
  onLogoutSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pegawai,
  instansi,
  onLoginSuccess,
  onLogoutSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (res.user) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Jendela login ditutup sebelum proses selesai.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Permintaan login dibatalkan.');
      } else {
        setErrorMessage(err.message || 'Gagal melakukan login. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await logoutUser();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Logout error:', err);
      setErrorMessage('Gagal keluar dari sesi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {currentUser ? 'Akun ASN Terhubung' : 'Autentikasi & Login ASN'}
              </h3>
              <p className="text-xs text-slate-400">
                Sistem Informasi e-RKP {instansi.nama_unit_kerja || 'Sekolah Rakyat'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Alert if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged In State Card */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User Photo'}
                      className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-lg">
                      {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-sm truncate">
                        {currentUser.displayName || pegawai.nama}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <p className="text-[11px] text-blue-400 font-mono mt-0.5">NIP: {pegawai.nip}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Jabatan</span>
                    <span className="text-slate-300 font-medium truncate block">{pegawai.jabatan}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Unit Kerja</span>
                    <span className="text-slate-300 font-medium truncate block">{pegawai.unit_kerja}</span>
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Data kinerja tersinkronisasi otomatis dengan akun cloud ASN Anda.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs sm:text-sm font-medium transition-colors border border-slate-700 text-center"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Keluar / Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Sign In Option */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <p className="text-xs sm:text-sm text-slate-300">
                  Masuk untuk mengamankan data hasil kinerja, sinkronisasi cloud real-time, dan memverifikasi identitas ASN Anda.
                </p>
                <p className="text-[11px] text-slate-500">
                  Didukung oleh Google Identity Platform dengan enkripsi penuh.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm transition-all shadow-md shadow-white/10 flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Menghubungkan ke Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google G Logo SVG */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Masuk dengan Akun Google</span>
                  </>
                )}
              </button>

              {/* Current ASN Identity Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-300">Profil Pegawai Saat Ini:</span>
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Siap Digunakan
                  </span>
                </div>
                <div className="font-medium text-white">{pegawai.nama}</div>
                <div className="text-slate-400 font-mono text-[11px]">NIP: {pegawai.nip}</div>
                <div className="text-slate-400 text-[11px] truncate">{pegawai.jabatan} • {pegawai.unit_kerja}</div>
              </div>

              {/* Security badges footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Enkripsi SSL 256-bit</span>
                </span>
                <span className="text-slate-500">•</span>
                <span>Standar e-Kinerja BKN</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
