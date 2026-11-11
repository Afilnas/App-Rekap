export interface LampiranBukti {
  id: string;
  laporan_id: string;
  file_path: string; // base64 or URL
  deskripsi_foto: string; // e.g. "Foto saat memimpin rapat pembahasan SOP"
  original_size?: number; // bytes before compression
  compressed_size?: number; // bytes after compression
  created_at: string;
}

export interface ItemRKP {
  id: string;
  kode: string; // e.g. "RKP-01"
  nama: string; // e.g. "Pengelolaan dan Penataan Infrastruktur SPBE serta Keamanan Siber"
  keterangan?: string;
}

export interface LaporanRKP {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jam_mulai: string; // HH:mm
  jam_selesai: string; // HH:mm
  uraian_kegiatan: string;
  volume: number;
  satuan: string; // e.g. "Dokumen", "Kegiatan", "Laporan", "Paket"
  keterangan: string; // e.g. "Selesai 100%", "Koordinasi Lintas Bidang"
  rkp_id?: string;
  kategori_skp?: string; // nama RKP / Target Kinerja
  lampiran: LampiranBukti[];
  status_verifikasi: 'Disetujui' | 'Menunggu Verifikasi' | 'Perlu Perbaikan';
  catatan_atasan?: string;
  created_at: string;
  updated_at: string;
}

export interface InstansiSetting {
  nama_instansi_atas: string; // e.g. "KEMENTERIAN SOSIAL REPUBLIK INDONESIA"
  nama_dinas: string; // e.g. "DIREKTORAT JENDERAL REHABILITASI SOSIAL"
  nama_unit_kerja: string; // e.g. "SEKOLAH RAKYAT" (berada setelah nama dinas sebelum alamat)
  alamat_instansi: string; // e.g. "Jl. Salemba Raya No. 28, Jakarta Pusat | Telp: (021) 3103591"
  logo_kiri: string; // Logo Unit Kerja Sekolah Rakyat (di sebelah kiri kop surat)
  logo_kanan: string; // Logo Instansi Kementerian Sosial RI (di sebelah kanan kop surat)
  logo_path?: string; // fallback
  nama_atasan?: string;
  nip_atasan?: string;
  jabatan_atasan?: string;
  pangkat_gol_atasan?: string;
  kota_tanda_tangan: string; // e.g. "Jakarta"
}

export interface UserPegawai {
  nama: string;
  nip: string;
  jabatan: string;
  unit_kerja: string;
  pangkat_gol: string;
}

export type ViewTab = 'dashboard' | 'history' | 'rekap';
