/**
 * Kontrak tipe backend Django.
 * Fase 7.2: varian kembali ke ItemPesanan; SpkProduksi = VIEW turunan
 * (item × desain) tanpa menyimpan varian/gambar/spesifikasi.
 */

export type StatusPesanan =
  | 'DRAFT'
  | 'SPK_DIKIRIM'
  | 'REVISI'
  | 'DISETUJUI'
  | 'PRODUKSI'
  | 'SELESAI'
  | 'DIAMBIL'
  | 'BATAL';

export type JenisItem = 'KAOS' | 'KEMEJA' | 'POLO';
export type Lengan = 'PENDEK' | 'PANJANG';
export type Kategori = 'DEWASA' | 'ANAK';
export type JenisSpk = 'POLOS' | 'SABLON' | 'BORDIR' | 'CAMPURAN';
export type StatusBayar = 'BELUM_BAYAR' | 'DP' | 'LUNAS';
export type MetodeBayar = 'TUNAI' | 'TRANSFER';

export interface Customer {
  id: number;
  nama: string;
  no_wa: string;
  alamat: string;
  catatan: string;
  created_at: string;
}

export interface BahanKain {
  id: number;
  nama: string;
  warna: string;
  harga_per_meter: number;
  stok_meter: number;
  aktif: boolean;
  created_at: string;
}

export interface VarianUkuran {
  id: number;
  item_id: number;
  kategori: Kategori;
  ukuran: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface SpesifikasiBaris {
  label: string;
  nilai: string;
}

/** Satu desain/spesifikasi produksi pada sebuah item. */
export interface DesainItem {
  label_desain: string;
  jenis_spk: JenisSpk;
  gambar_depan?: string | null;
  gambar_belakang?: string | null;
  gambar_desain?: string | null;
  bordir_titik?: number | null;
  bordir_keterangan?: string;
  spesifikasi: SpesifikasiBaris[];
}

/** Spesifikasi dasar baju + varian + daftar desain. */
export interface ItemPesanan {
  id: number;
  pesanan_id: number;
  jenis: JenisItem;
  kain: BahanKain;
  lengan: Lengan;
  warna: string;
  saku: boolean;
  varian: VarianUkuran[];
  desain: DesainItem[];
  spesifikasi?: SpesifikasiBaris[];
}

/** VIEW turunan: 1 SPK = 1 desain pada 1 item (tidak menyimpan data produksi). */
export interface SpkProduksi {
  id: number;
  nomor_spk: string;
  nomor_urut: number;
  item_id: number;
  desain_index: number;
  label_desain?: string;
  jenis_spk?: JenisSpk;
}

export interface LogStatus {
  id: number;
  pesanan_id: number;
  status_lama: StatusPesanan | '';
  status_baru: StatusPesanan;
  keterangan: string;
  created_at: string;
}

export interface Kendala {
  id: number;
  pesanan_id: number;
  jenis: string;
  catatan: string;
  estimasi_mundur_hari: number;
  pesanan_nomor?: string;
  created_at: string;
}

export interface Pesanan {
  id: number;
  nomor: string;
  customer: Customer;
  status: StatusPesanan;
  deadline: string;
  catatan: string;
  designer?: string;
  status_bayar: StatusBayar;
  dibayar: number;
  metode_bayar?: MetodeBayar;
  catatan_bayar?: string;
  total_harga: number;
  items: ItemPesanan[];
  spk: SpkProduksi[];
  log: LogStatus[];
  kendala?: Kendala[];
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  aktif: number;
  produksi: number;
  menunggu: number;
  deadline_dekat: Pesanan[];
  kendala: Kendala[];
}

export interface AntrianData {
  sedang_dikerjakan: Pesanan | null;
  menunggu: Pesanan[];
}

export interface VarianCreate {
  kategori: Kategori;
  ukuran: string;
  jumlah: number;
  harga_satuan: number;
}

export interface DesainCreate {
  label_desain: string;
  jenis_spk: JenisSpk;
  gambar_depan?: string | null;
  gambar_belakang?: string | null;
  gambar_desain?: string | null;
  bordir_titik?: number | null;
  bordir_keterangan?: string;
  spesifikasi: SpesifikasiBaris[];
}

export interface ItemCreate {
  jenis: JenisItem;
  kain_id: number;
  lengan: Lengan;
  warna: string;
  saku: boolean;
  varian: VarianCreate[];
  desain: DesainCreate[];
  spesifikasi?: SpesifikasiBaris[];
}

export interface PesananCreate {
  customer_id: number;
  deadline: string;
  catatan: string;
  designer?: string;
  items: ItemCreate[];
}

export interface CustomerCreate {
  nama: string;
  no_wa: string;
  alamat: string;
  catatan: string;
}

export interface KainCreate {
  nama: string;
  warna: string;
  harga_per_meter: number;
  stok_meter: number;
  aktif: boolean;
}

export interface KendalaCreate {
  jenis: string;
  catatan: string;
  estimasi_mundur_hari: number;
}