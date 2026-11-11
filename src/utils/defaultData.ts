import { InstansiSetting, UserPegawai, LaporanRKP, ItemRKP } from '../types';

export const DEFAULT_DAFTAR_RKP: ItemRKP[] = [
  {
    id: 'rkp-1',
    kode: 'RKP-01',
    nama: 'Penyelenggaraan Pembelajaran, Bimbingan Belajar, dan Penguatan Karakter Siswa Sekolah Rakyat',
    keterangan: 'Tugas Utama Pembelajaran & Edukasi'
  },
  {
    id: 'rkp-2',
    kode: 'RKP-02',
    nama: 'Pemeliharaan Sarana Prasarana, Fasilitas Belajar, dan Perangkat Pembelajaran Interaktif',
    keterangan: 'Tugas Pemeliharaan Sarpras & TI'
  },
  {
    id: 'rkp-3',
    kode: 'RKP-03',
    nama: 'Asesmen Kebutuhan Vokasional, Bimbingan Keterampilan, dan Evaluasi Kurikulum',
    keterangan: 'Pengembangan Kompetensi & Kurikulum'
  },
  {
    id: 'rkp-4',
    kode: 'RKP-04',
    nama: 'Pendampingan Sosial, Motivasi, dan Pembinaan Minat Bakat Peserta Didik',
    keterangan: 'Bimbingan Sosial & Layanan Warga Belajar'
  },
  {
    id: 'rkp-5',
    kode: 'RKP-05',
    nama: 'Penyusunan Standar Operasional Prosedur (SOP) dan Layanan Inklusif Unit Kerja Sekolah Rakyat',
    keterangan: 'Tata Kelola & Regulasi Unit Kerja'
  }
];

// Logo Kiri: Unit Kerja Sekolah Rakyat
export const LOGO_SEKOLAH_RAKYAT = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100" height="100"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230284c7;stop-opacity:1"/><stop offset="100%" style="stop-color:%230369a1;stop-opacity:1"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23fef08a;stop-opacity:1"/><stop offset="100%" style="stop-color:%23eab308;stop-opacity:1"/></linearGradient></defs><circle cx="70" cy="70" r="66" fill="%23ffffff" stroke="%230284c7" stroke-width="4"/><circle cx="70" cy="70" r="58" fill="url(%23bgGrad)"/><path d="M70 20 L76 34 L91 36 L80 47 L83 62 L70 55 L57 62 L60 47 L49 36 L64 34 Z" fill="url(%23goldGrad)"/><path d="M40 75 Q70 65 70 88 Q70 65 100 75 L98 96 Q70 86 70 106 Q70 86 42 96 Z" fill="%23ffffff" stroke="%23eab308" stroke-width="2"/><line x1="70" y1="88" x2="70" y2="106" stroke="%230284c7" stroke-width="2.5"/><circle cx="70" cy="54" r="5" fill="%23ef4444"/><path d="M68 50 Q70 42 72 50 Z" fill="%23f97316"/><text x="70" y="122" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="%23ffffff" text-anchor="middle" letter-spacing="1">SEKOLAH RAKYAT</text></svg>';

// Logo Kanan: Kementerian Sosial Republik Indonesia
export const LOGO_KEMENSOS = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100" height="100"><defs><linearGradient id="kemBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%231e3a8a;stop-opacity:1"/><stop offset="100%" style="stop-color:%23172554;stop-opacity:1"/></linearGradient><linearGradient id="kemGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23fde047;stop-opacity:1"/><stop offset="100%" style="stop-color:%23ca8a04;stop-opacity:1"/></linearGradient></defs><circle cx="70" cy="70" r="66" fill="%23ffffff" stroke="%23ca8a04" stroke-width="3"/><circle cx="70" cy="70" r="59" fill="url(%23kemBlue)"/><circle cx="70" cy="70" r="51" fill="none" stroke="%23facc15" stroke-width="1.5" stroke-dasharray="3,2"/><path d="M70 26 L74 38 L87 38 L76 46 L80 58 L70 50 L60 58 L64 46 L53 38 L66 38 Z" fill="url(%23kemGold)"/><path d="M42 85 C42 66 54 58 70 58 C86 58 98 66 98 85 C98 96 86 100 70 100 C54 100 42 96 42 85 Z" fill="%23ffffff" opacity="0.95"/><path d="M50 82 C55 74 62 70 70 70 C78 70 85 74 90 82 C84 89 77 93 70 93 C63 93 56 89 50 82 Z" fill="%231e3a8a"/><circle cx="70" cy="78" r="4" fill="%23dc2626"/><text x="70" y="118" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="%23fde047" text-anchor="middle" letter-spacing="0.5">KEMENSOS RI</text></svg>';

// Preset 3: Garuda Pancasila RI (Emas)
export const LOGO_GARUDA = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100" height="100"><defs><linearGradient id="garudaGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23fef08a;stop-opacity:1"/><stop offset="50%" style="stop-color:%23eab308;stop-opacity:1"/><stop offset="100%" style="stop-color:%23b45309;stop-opacity:1"/></linearGradient></defs><circle cx="70" cy="70" r="66" fill="%23ffffff" stroke="%23b45309" stroke-width="2.5"/><path d="M70 24 C72 20 78 22 76 28 C80 27 86 32 80 37 C87 36 93 42 86 48 C95 48 100 56 90 62 C104 63 108 76 96 82 C106 87 104 98 90 98 C78 98 72 90 70 90 C68 90 62 98 50 98 C36 98 34 87 44 82 C32 76 36 63 50 62 C40 56 45 48 54 48 C47 42 53 36 60 37 C54 32 60 27 64 28 C62 22 68 20 70 24 Z" fill="url(%23garudaGold)"/><rect x="58" y="55" width="24" height="28" rx="3" fill="%23dc2626" stroke="%23ffffff" stroke-width="1.5"/><rect x="58" y="69" width="24" height="14" fill="%23ffffff"/><path d="M70 57 L72 63 L78 63 L73 67 L75 73 L70 69 L65 73 L67 67 L62 63 L68 63 Z" fill="%23facc15"/><rect x="42" y="103" width="56" height="13" rx="2" fill="%23ffffff" stroke="%23b45309" stroke-width="1.5"/><text x="70" y="113" font-family="Arial,sans-serif" font-size="6.5" font-weight="bold" fill="%23b45309" text-anchor="middle" letter-spacing="0.5">BHINNEKA TUNGGAL IKA</text></svg>';

// Preset 4: Pemerintah Provinsi / Daerah (Bintang & Padi Kapas)
export const LOGO_PEMDA = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100" height="100"><defs><linearGradient id="pemdaShield" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23059669;stop-opacity:1"/><stop offset="100%" style="stop-color:%23065f46;stop-opacity:1"/></linearGradient></defs><circle cx="70" cy="70" r="66" fill="%23ffffff" stroke="%23059669" stroke-width="3"/><path d="M70 22 C92 22 104 36 104 60 C104 90 85 108 70 116 C55 108 36 90 36 60 C36 36 48 22 70 22 Z" fill="url(%23pemdaShield)" stroke="%23facc15" stroke-width="2"/><path d="M70 34 L73 43 L82 43 L75 48 L78 57 L70 52 L62 57 L65 48 L58 43 L67 43 Z" fill="%23facc15"/><circle cx="70" cy="72" r="16" fill="%23ffffff" stroke="%23facc15" stroke-width="1.5"/><path d="M60 80 Q70 60 80 80" stroke="%23dc2626" stroke-width="3" fill="none"/><text x="70" y="126" font-family="Arial,sans-serif" font-size="7.5" font-weight="bold" fill="%23065f46" text-anchor="middle">PEMERINTAH DAERAH</text></svg>';

// Preset 5: Tut Wuri Handayani / Pendidikan
export const LOGO_TUTWURI = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="100" height="100"><defs><linearGradient id="tutBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%232563eb;stop-opacity:1"/><stop offset="100%" style="stop-color:%231d4ed8;stop-opacity:1"/></linearGradient></defs><circle cx="70" cy="70" r="66" fill="%23ffffff" stroke="%232563eb" stroke-width="3"/><path d="M70 24 L108 52 L94 100 L46 100 L32 52 Z" fill="url(%23tutBlue)" stroke="%23facc15" stroke-width="2"/><circle cx="70" cy="50" r="8" fill="%23facc15"/><path d="M68 44 Q70 34 72 44 Z" fill="%23ef4444"/><path d="M48 76 Q70 64 70 88 Q70 64 92 76" stroke="%23ffffff" stroke-width="3" fill="none"/><path d="M54 84 Q70 72 70 94 Q70 72 86 84" stroke="%23facc15" stroke-width="2.5" fill="none"/><text x="70" y="124" font-family="Arial,sans-serif" font-size="7" font-weight="bold" fill="%231d4ed8" text-anchor="middle">TUT WURI HANDAYANI</text></svg>';

export interface PresetLogoItem {
  id: string;
  nama: string;
  deskripsi: string;
  src: string;
  tag: 'Unit Kerja' | 'Kementerian' | 'Nasional' | 'Daerah' | 'Pendidikan';
}

export const PRESET_LOGOS: PresetLogoItem[] = [
  {
    id: 'preset-sekolah-rakyat',
    nama: 'Unit Kerja Sekolah Rakyat',
    deskripsi: 'Logo resmi Unit Kerja Sekolah Rakyat Kemensos RI',
    src: LOGO_SEKOLAH_RAKYAT,
    tag: 'Unit Kerja'
  },
  {
    id: 'preset-kemensos',
    nama: 'Kementerian Sosial RI',
    deskripsi: 'Logo resmi Kementerian Sosial Republik Indonesia',
    src: LOGO_KEMENSOS,
    tag: 'Kementerian'
  },
  {
    id: 'preset-garuda',
    nama: 'Garuda Pancasila Emas',
    deskripsi: 'Lambang Negara Republik Indonesia resmi',
    src: LOGO_GARUDA,
    tag: 'Nasional'
  },
  {
    id: 'preset-pemda',
    nama: 'Pemerintah Daerah / Provinsi',
    deskripsi: 'Lambang Bintang Emas, Perisai & Padi Kapas Pemda',
    src: LOGO_PEMDA,
    tag: 'Daerah'
  },
  {
    id: 'preset-tutwuri',
    nama: 'Pendidikan / Tut Wuri Handayani',
    deskripsi: 'Lambang resmi Kementerian Pendidikan / Balai Diklat',
    src: LOGO_TUTWURI,
    tag: 'Pendidikan'
  }
];

export const DEFAULT_INSTANSI: InstansiSetting = {
  nama_instansi_atas: 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA',
  nama_dinas: 'DIREKTORAT JENDERAL REHABILITASI SOSIAL',
  nama_unit_kerja: 'SEKOLAH RAKYAT',
  alamat_instansi: 'Jl. Salemba Raya No. 28, Kenari, Senen, Jakarta Pusat 10430 | Telp: (021) 3103591 | Website: kemensos.go.id',
  logo_kiri: LOGO_SEKOLAH_RAKYAT,
  logo_kanan: LOGO_KEMENSOS,
  logo_path: LOGO_KEMENSOS,
  nama_atasan: 'Drs. H. ACHMAD SUPRAYOGI, M.Si',
  nip_atasan: '19720412 199803 1 002',
  jabatan_atasan: 'Kepala Unit Kerja Sekolah Rakyat',
  pangkat_gol_atasan: 'Pembina Utama Muda (IV/c)',
  kota_tanda_tangan: 'Jakarta'
};

export const DEFAULT_PEGAWAI: UserPegawai = {
  nama: 'VANDI ILHAM SAPUTRA, S.Pd., M.Sos',
  nip: '19940615 202012 1 005',
  jabatan: 'Penyuluh Sosial Ahli Pertama',
  unit_kerja: 'Unit Kerja Sekolah Rakyat',
  pangkat_gol: 'Penata Muda Tingkat I (III/b)'
};

// High quality realistic images for government activity documentation
const SAMPLE_IMG_MEETING = 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80';
const SAMPLE_IMG_DATACENTER = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80';
const SAMPLE_IMG_SECURITY = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80';
const SAMPLE_IMG_TRAINING = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=900&q=80';
const SAMPLE_IMG_NOTE = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80';

export const INITIAL_REPORTS: LaporanRKP[] = [
  {
    id: 'rkp-001',
    rkp_id: 'rkp-5',
    tanggal: '2026-11-09',
    jam_mulai: '08:00',
    jam_selesai: '10:30',
    uraian_kegiatan: 'Memimpin rapat pembahasan draf SOP Pengamanan Fisik Fasilitas dan Manajemen Layanan Inklusif Unit Kerja Sekolah Rakyat',
    volume: 1,
    satuan: 'Dokumen',
    keterangan: 'Draf SOP selesai dibahas bersama Tim Fasilitator dan Notula terbit',
    kategori_skp: 'Tugas Pokok (Pengelolaan Layanan Unit)',
    status_verifikasi: 'Disetujui',
    catatan_atasan: 'SOP sudah sesuai standar Kemensos, lanjutkan ke tahapan legalisasi.',
    created_at: '2026-11-09T10:35:00.000Z',
    updated_at: '2026-11-09T10:35:00.000Z',
    lampiran: [
      {
        id: 'buk-101',
        laporan_id: 'rkp-001',
        file_path: SAMPLE_IMG_MEETING,
        deskripsi_foto: 'Foto saat memimpin rapat pembahasan SOP bersama fasilitator dan instruktur',
        original_size: 3450000,
        compressed_size: 198000,
        created_at: '2026-11-09T09:45:00.000Z'
      },
      {
        id: 'buk-102',
        laporan_id: 'rkp-001',
        file_path: SAMPLE_IMG_NOTE,
        deskripsi_foto: 'Tangkapan layar penelaahan draf modul dan klausul standar operasional prosedur',
        original_size: 2890000,
        compressed_size: 165000,
        created_at: '2026-11-09T10:15:00.000Z'
      }
    ]
  },
  {
    id: 'rkp-002',
    rkp_id: 'rkp-2',
    tanggal: '2026-11-09',
    jam_mulai: '11:00',
    jam_selesai: '12:30',
    uraian_kegiatan: 'Melakukan monitoring sarana prasarana belajar, pemeriksaan perangkat komputer lab, serta jaringan internet kelas interaktif',
    volume: 1,
    satuan: 'Kegiatan',
    keterangan: 'Seluruh PC dan koneksi internet berfungsi normal dan siap dipakai pembelajaran',
    kategori_skp: 'Tugas Pokok (Pemeliharaan Fasilitas Belajar)',
    status_verifikasi: 'Disetujui',
    catatan_atasan: 'Catatan log pemeliharaan lengkap.',
    created_at: '2026-11-09T12:35:00.000Z',
    updated_at: '2026-11-09T12:35:00.000Z',
    lampiran: [
      {
        id: 'buk-103',
        laporan_id: 'rkp-002',
        file_path: SAMPLE_IMG_DATACENTER,
        deskripsi_foto: 'Pemeriksaan kelayakan perangkat komputer, switch jaringan, dan akses Wi-Fi',
        original_size: 4200000,
        compressed_size: 215000,
        created_at: '2026-11-09T11:45:00.000Z'
      }
    ]
  },
  {
    id: 'rkp-003',
    rkp_id: 'rkp-3',
    tanggal: '2026-11-08',
    jam_mulai: '08:30',
    jam_selesai: '11:45',
    uraian_kegiatan: 'Pelaksanaan asesmen kebutuhan pelatihan vokasional dan evaluasi berkala modul kurikulum Sekolah Rakyat',
    volume: 1,
    satuan: 'Laporan',
    keterangan: 'Laporan asesmen kebutuhan 25 peserta didik selesai disusun untuk semester berjalan',
    kategori_skp: 'Tugas Pokok (Asesmen & Kurikulum)',
    status_verifikasi: 'Disetujui',
    catatan_atasan: 'Bagus, segera koordinasikan dengan instruktur keterampilan.',
    created_at: '2026-11-08T11:50:00.000Z',
    updated_at: '2026-11-08T11:50:00.000Z',
    lampiran: [
      {
        id: 'buk-104',
        laporan_id: 'rkp-003',
        file_path: SAMPLE_IMG_SECURITY,
        deskripsi_foto: 'Dokumentasi penelaahan data hasil asesmen dan pemetaan kompetensi siswa',
        original_size: 2150000,
        compressed_size: 142000,
        created_at: '2026-11-08T10:30:00.000Z'
      }
    ]
  },
  {
    id: 'rkp-004',
    rkp_id: 'rkp-4',
    tanggal: '2026-11-07',
    jam_mulai: '13:00',
    jam_selesai: '16:00',
    uraian_kegiatan: 'Memberikan bimbingan sosial dan pendampingan motivasi belajar bagi warga belajar Unit Kerja Sekolah Rakyat',
    volume: 20,
    satuan: 'Peserta',
    keterangan: '20 warga binaan aktif berpartisipasi dan menyelesaikan sesi motivasi dengan antusias',
    kategori_skp: 'Tugas Tambahan (Pendampingan & Bimbingan Sosial)',
    status_verifikasi: 'Disetujui',
    catatan_atasan: 'Sangat baik, respon peserta sangat positif.',
    created_at: '2026-11-07T16:15:00.000Z',
    updated_at: '2026-11-07T16:15:00.000Z',
    lampiran: [
      {
        id: 'buk-105',
        laporan_id: 'rkp-004',
        file_path: SAMPLE_IMG_TRAINING,
        deskripsi_foto: 'Suasana pendampingan belajar interaktif dan diskusi kelompok bersama warga binaan',
        original_size: 3800000,
        compressed_size: 185000,
        created_at: '2026-11-07T14:30:00.000Z'
      }
    ]
  }
];
