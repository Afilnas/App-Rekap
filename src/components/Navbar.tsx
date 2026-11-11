import React from 'react';
import { InstansiSetting, UserPegawai, ViewTab } from '../types';
import {
  FileText,
  Calendar,
  Settings,
  PlusCircle,
  ShieldCheck,
  Building2,
  UserCheck,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { formatDateIndonesian } from '../utils/reportUtils';
import { User } from '../firebase';

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  instansi: InstansiSetting;
  pegawai: UserPegawai;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenNewReport: () => void;
  onOpenSettings: (tab?: 'instansi' | 'rkp' | 'pegawai') => void;
  onOpenRekap: () => void;
  todayReportsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  instansi,
  pegawai,
  currentUser,
  onOpenLogin,
  onOpenNewReport,
  onOpenSettings,
  onOpenRekap,
  todayReportsCount
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      {/* Top Bar for Government App Branding */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              STANDAR e-KINERJA BKN
            </span>
            <span className="text-slate-300 font-medium truncate max-w-[280px] sm:max-w-none">
              {instansi.nama_instansi_atas} • {instansi.nama_dinas} • <strong className="text-amber-400">{instansi.nama_unit_kerja}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {formatDateIndonesian(todayStr)}
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              NIP: {pegawai.nip}
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Kelola Akun Login"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate max-w-[120px]">{currentUser.displayName || currentUser.email}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Dual Logos (Sekolah Rakyat & Kemensos) & App Title */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onOpenSettings('instansi')}
              className="flex items-center -space-x-1 cursor-pointer group"
              title="Klik untuk Edit / Ganti Logo Kop Surat"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-500/40 group-hover:border-sky-400 flex items-center justify-center p-1 overflow-hidden shadow-inner transition-transform group-hover:scale-105" title="Logo Unit Kerja Sekolah Rakyat (Klik untuk Ganti)">
                <img
                  src={instansi.logo_kiri || instansi.logo_path}
                  alt="Logo Sekolah Rakyat"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 group-hover:border-blue-400 flex items-center justify-center p-1 overflow-hidden shadow-inner transition-transform group-hover:scale-105" title="Logo Kementerian Sosial RI (Klik untuk Ganti)">
                <img
                  src={instansi.logo_kanan || instansi.logo_path}
                  alt="Logo Kemensos RI"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSettings('instansi')}
                  className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent hover:opacity-90 text-left transition-opacity"
                  title="Klik untuk Pengaturan Kop Surat & Logo"
                >
                  e-RKP {instansi.nama_unit_kerja || 'Sekolah Rakyat'}
                </button>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Kemensos RI
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-tight">
                Laporan Kinerja Harian ASN Pegawai & Bukti Fisik
              </p>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Laporan & Riwayat</span>
              {todayReportsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-800 text-blue-100 text-[10px]">
                  {todayReportsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenRekap}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Rekap Bulanan</span>
              <span className="sm:hidden">Rekap</span>
            </button>

            <button
              onClick={() => onOpenSettings('instansi')}
              title="Pengaturan Kop Surat & Logo"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Pengaturan Instansi"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Login / User Profile Button */}
            <button
              type="button"
              onClick={onOpenLogin}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 border ${
                currentUser
                  ? 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40'
              }`}
              title={currentUser ? `Akun: ${currentUser.email}` : 'Masuk dengan Akun Google'}
            >
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="hidden md:inline font-medium">
                    {currentUser.displayName?.split(' ')[0] || 'Akun ASN'}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Masuk</span>
                </>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewReport}
              className="ml-1 sm:ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/40 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Laporan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
