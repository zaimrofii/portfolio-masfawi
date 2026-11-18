import type {
  BahanKain,
  Customer,
  ItemPesanan,
  JenisItem,
  JenisSpk,
  Kategori,
  Kendala,
  Lengan,
  LogStatus,
  Pesanan,
  SpkProduksi,
  SpesifikasiBaris,
  StatusPesanan,
  VarianUkuran,
} from '../../api/types';
import { generateNomorSpk } from '@/lib/spkNomor';
import { customersSeed } from './customers';
import { kainSeed } from './kain';

/** Tanggal acuan mock: semua perhitungan sisaHari relatif ke tanggal ini. */
export const HARI_INI = '2026-11-16';

/** Placeholder 1x1 px JPEG (demo preview SPK; ganti dengan URL backend nanti). */
const GAMBAR_CONTOH =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

interface VarianSpec {
  kategori: Kategori;
  ukuran: string;
  jumlah: number;
  harga_satuan: number;
}

interface DesainSpec {
  label_desain: string;
  jenis_spk: JenisSpk;
  gambar_depan?: string;
  gambar_belakang?: string;
  gambar_desain?: string;
  bordir_titik?: number;
  bordir_keterangan?: string;
  spesifikasi?: SpesifikasiBaris[];
  varian: VarianSpec[];
}

interface ItemSpec {
  jenis: JenisItem;
  kain: number;
  lengan: Lengan;
  warna: string;
  saku: boolean;
  desain: DesainSpec[];
  spesifikasi?: SpesifikasiBaris[];
}

interface KendalaSpec {
  jenis: string;
  catatan: string;
  estimasi_mundur_hari: number;
}

interface PesananSpec {
  customer: number;
  designer?: string;
  status: StatusPesanan;
  deadline: string;
  catatan: string;
  items: ItemSpec[];
  kendala?: KendalaSpec;
}

const URUTAN_STATUS: StatusPesanan[] = [
  'DRAFT',
  'SPK_DIKIRIM',
  'REVISI',
  'DISETUJUI',
  'PRODUKSI',
  'SELESAI',
  'DIAMBIL',
];

const SPECS: PesananSpec[] = [
  {
    customer: 0,
    designer: 'Mbak Rina',
    status: 'DRAFT',
    deadline: '2026-11-25',
    catatan: 'Kaos reuni keluarga',
    items: [
      {
        jenis: 'KAOS',
        kain: 0,
        lengan: 'PENDEK',
        warna: 'Hitam',
        saku: false,
        desain: [
          {
            label_desain: 'Logo reuni depan',
            jenis_spk: 'SABLON',
            spesifikasi: [
              { label: 'Teknik', nilai: 'DTF' },
              { label: 'Posisi', nilai: 'Dada kiri' },
            ],
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 12, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 6, harga_satuan: 90000 },
              { kategori: 'ANAK', ukuran: 'S', jumlah: 4, harga_satuan: 60000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 1,
    designer: 'Mas Dedi',
    status: 'DRAFT',
    deadline: '2026-11-28',
    catatan: 'Seragam kerja bengkel',
    items: [
      {
        jenis: 'KEMEJA',
        kain: 1,
        lengan: 'PANJANG',
        warna: 'Biru',
        saku: true,
        desain: [
          {
            label_desain: 'Polos',
            jenis_spk: 'POLOS',
            spesifikasi: [{ label: 'Model', nilai: 'Kemeja lengan panjang' }],
            varian: [
              { kategori: 'DEWASA', ukuran: 'M', jumlah: 8, harga_satuan: 125000 },
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 10, harga_satuan: 125000 },
            ],
          },
        ],
      },
      {
        jenis: 'POLO',
        kain: 2,
        lengan: 'PENDEK',
        warna: 'Putih',
        saku: true,
        desain: [
          {
            label_desain: 'Bordir logo bengkel',
            jenis_spk: 'BORDIR',
            bordir_titik: 2,
            bordir_keterangan: 'Logo dada kiri',
            spesifikasi: [{ label: 'Titik bordir', nilai: '2' }],
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 6, harga_satuan: 110000 },
              { kategori: 'ANAK', ukuran: 'M', jumlah: 3, harga_satuan: 80000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 2,
    status: 'SPK_DIKIRIM',
    deadline: '2026-11-22',
    catatan: 'Jersey futsal RT 04',
    items: [
      {
        jenis: 'KAOS',
        kain: 3,
        lengan: 'PENDEK',
        warna: 'Navy',
        saku: false,
        desain: [
          {
            label_desain: 'Nama + nomor punggung',
            jenis_spk: 'SABLON',
            spesifikasi: [
              { label: 'Teknik', nilai: 'DTF' },
              { label: 'Posisi', nilai: 'Punggung' },
            ],
            varian: [
              { kategori: 'DEWASA', ukuran: 'M', jumlah: 10, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 10, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 5, harga_satuan: 90000 },
            ],
          },
          {
            label_desain: 'Bordir logo tim',
            jenis_spk: 'BORDIR',
            bordir_titik: 1,
            bordir_keterangan: 'Logo kecil dada kiri',
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 10, harga_satuan: 15000 },
            ],
          },
        ],
      },
    ],
  },  {
    customer: 3,
    status: 'SPK_DIKIRIM',
    deadline: '2026-12-02',
    catatan: 'Seragam butik, 2 model',
    items: [
      {
        jenis: 'KEMEJA',
        kain: 4,
        lengan: 'PANJANG',
        warna: 'Abu',
        saku: true,
        desain: [
          {
            label_desain: 'Polos',
            jenis_spk: 'POLOS',
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 4, harga_satuan: 120000 },
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 3, harga_satuan: 120000 },
            ],
          },
        ],
      },
      {
        jenis: 'KAOS',
        kain: 0,
        lengan: 'PENDEK',
        warna: 'Hitam',
        saku: false,
        desain: [
          {
            label_desain: 'Sablon 2 warna',
            jenis_spk: 'SABLON',
            spesifikasi: [{ label: 'Teknik', nilai: 'Manual' }],
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 6, harga_satuan: 85000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 4,
    status: 'REVISI',
    deadline: '2026-11-24',
    catatan: 'Revisi desain sablon',
    items: [
      {
        jenis: 'KAOS',
        kain: 3,
        lengan: 'PENDEK',
        warna: 'Navy',
        saku: false,
        desain: [
          {
            label_desain: 'Logo diperbesar',
            jenis_spk: 'SABLON',
            spesifikasi: [{ label: 'Catatan revisi', nilai: 'Logo +20%' }],
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 8, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 4, harga_satuan: 90000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 5,
    designer: 'Mbak Rina',
    status: 'DISETUJUI',
    deadline: '2026-11-19',
    catatan: 'Kaos komunitas lari',
    items: [
      {
        jenis: 'KAOS',
        kain: 0,
        lengan: 'PENDEK',
        warna: 'Hitam',
        saku: false,
        desain: [
          {
            label_desain: 'Logo komunitas',
            jenis_spk: 'SABLON',
            spesifikasi: [{ label: 'Posisi', nilai: 'Depan-belakang' }],
            varian: [
              { kategori: 'DEWASA', ukuran: 'M', jumlah: 6, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 6, harga_satuan: 85000 },
              { kategori: 'ANAK', ukuran: 'S', jumlah: 2, harga_satuan: 60000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 0,
    status: 'DISETUJUI',
    deadline: '2026-11-27',
    catatan: 'Seragam kerja tambahan',
    items: [
      {
        jenis: 'KEMEJA',
        kain: 1,
        lengan: 'PANJANG',
        warna: 'Biru',
        saku: true,
        desain: [
          {
            label_desain: 'Bordir inisial',
            jenis_spk: 'BORDIR',
            bordir_titik: 2,
            bordir_keterangan: 'Inisial nama',
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 5, harga_satuan: 125000 },
            ],
          },
        ],
      },
      {
        jenis: 'KAOS',
        kain: 0,
        lengan: 'PENDEK',
        warna: 'Hitam',
        saku: false,
        desain: [
          {
            label_desain: 'Polos',
            jenis_spk: 'POLOS',
            varian: [
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 4, harga_satuan: 90000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 1,
    designer: 'Mas Dedi',
    status: 'PRODUKSI',
    deadline: '2026-11-20',
    catatan: 'Jersey futsal + kaos anak',
    items: [
      {
        jenis: 'KAOS',
        kain: 3,
        lengan: 'PENDEK',
        warna: 'Navy',
        saku: false,
        desain: [
          {
            label_desain: 'Jersey futsal',
            jenis_spk: 'CAMPURAN',
            gambar_depan: GAMBAR_CONTOH,
            gambar_belakang: GAMBAR_CONTOH,
            gambar_desain: GAMBAR_CONTOH,
            bordir_titik: 3,
            bordir_keterangan: 'Logo dada kiri',
            spesifikasi: [{ label: 'Sablon', nilai: 'DTF nama + nomor' }],
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 12, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 8, harga_satuan: 90000 },
            ],
          },
        ],
      },
      {
        jenis: 'KAOS',
        kain: 0,
        lengan: 'PENDEK',
        warna: 'Hitam',
        saku: false,
        desain: [
          {
            label_desain: 'Polos',
            jenis_spk: 'POLOS',
            varian: [
              { kategori: 'ANAK', ukuran: 'M', jumlah: 5, harga_satuan: 60000 },
            ],
          },
        ],
      },
    ],
    kendala: {
      jenis: 'MESIN',
      catatan: 'Mesin sablon DTF error, menunggu sparepart',
      estimasi_mundur_hari: 2,
    },
  },  {
    customer: 2,
    status: 'SELESAI',
    deadline: '2026-11-15',
    catatan: 'Polo bordir butik',
    items: [
      {
        jenis: 'POLO',
        kain: 2,
        lengan: 'PENDEK',
        warna: 'Putih',
        saku: true,
        desain: [
          {
            label_desain: 'Bordir nama butik',
            jenis_spk: 'BORDIR',
            bordir_titik: 3,
            bordir_keterangan: 'Nama butik di dada',
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 7, harga_satuan: 110000 },
              { kategori: 'DEWASA', ukuran: 'XL', jumlah: 3, harga_satuan: 110000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 3,
    status: 'SELESAI',
    deadline: '2026-11-18',
    catatan: 'Kaos gathering kantor',
    items: [
      {
        jenis: 'KAOS',
        kain: 0,
        lengan: 'PENDEK',
        warna: 'Hitam',
        saku: false,
        desain: [
          {
            label_desain: 'Logo gathering',
            jenis_spk: 'SABLON',
            varian: [
              { kategori: 'DEWASA', ukuran: 'M', jumlah: 10, harga_satuan: 85000 },
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 10, harga_satuan: 85000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 4,
    status: 'DIAMBIL',
    deadline: '2026-11-10',
    catatan: 'Kemeja seragam, sudah diambil',
    items: [
      {
        jenis: 'KEMEJA',
        kain: 4,
        lengan: 'PANJANG',
        warna: 'Abu',
        saku: true,
        desain: [
          {
            label_desain: 'Polos',
            jenis_spk: 'POLOS',
            varian: [
              { kategori: 'DEWASA', ukuran: 'M', jumlah: 3, harga_satuan: 120000 },
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 3, harga_satuan: 120000 },
            ],
          },
        ],
      },
    ],
  },
  {
    customer: 5,
    status: 'BATAL',
    deadline: '2026-11-21',
    catatan: 'Dibatalkan customer',
    items: [
      {
        jenis: 'KAOS',
        kain: 3,
        lengan: 'PENDEK',
        warna: 'Navy',
        saku: false,
        desain: [
          {
            label_desain: 'Dibatalkan',
            jenis_spk: 'SABLON',
            varian: [
              { kategori: 'DEWASA', ukuran: 'L', jumlah: 5, harga_satuan: 85000 },
            ],
          },
        ],
      },
    ],
  },
];

function iso(day: number, hour: number): string {
  const dd = String(day).padStart(2, '0');
  const hh = String(hour).padStart(2, '0');
  return `2026-11-${dd}T${hh}:00:00+07:00`;
}

function bangunPesanan(specs: PesananSpec[]): Pesanan[] {
  let itemId = 0;
  let spkId = 0;
  let varianId = 0;
  let logId = 0;
  let kendalaId = 0;

  return specs.map((spec, index) => {
    const id = index + 1;
    const nomor = `PS-20261116-${String(id).padStart(3, '0')}`;
    const day = index + 1;

    const items: ItemPesanan[] = [];
    const spk: SpkProduksi[] = [];
    let urutSpk = 0;

    spec.items.forEach((itemSpec) => {
      const idItem = ++itemId;

      const daftarVarian: VarianUkuran[] = itemSpec.desain
        .flatMap((desainSpec) => desainSpec.varian)
        .map((varian) => ({
          id: ++varianId,
          item_id: idItem,
          kategori: varian.kategori,
          ukuran: varian.ukuran,
          jumlah: varian.jumlah,
          harga_satuan: varian.harga_satuan,
          subtotal: varian.jumlah * varian.harga_satuan,
        }));

      items.push({
        id: idItem,
        pesanan_id: id,
        jenis: itemSpec.jenis,
        kain: kainSeed[itemSpec.kain],
        lengan: itemSpec.lengan,
        warna: itemSpec.warna,
        saku: itemSpec.saku,
        varian: daftarVarian,
        desain: itemSpec.desain.map((desainSpec) => ({
          label_desain: desainSpec.label_desain,
          jenis_spk: desainSpec.jenis_spk,
          gambar_depan: desainSpec.gambar_depan ?? null,
          gambar_belakang: desainSpec.gambar_belakang ?? null,
          gambar_desain: desainSpec.gambar_desain ?? null,
          bordir_titik: desainSpec.bordir_titik ?? null,
          bordir_keterangan: desainSpec.bordir_keterangan ?? '',
          spesifikasi: desainSpec.spesifikasi ?? [],
        })),
        spesifikasi: itemSpec.spesifikasi ?? [],
      });

      itemSpec.desain.forEach((desainSpec, desainIndex) => {
        urutSpk += 1;

        spk.push({
          id: ++spkId,
          nomor_spk: generateNomorSpk(nomor, urutSpk),
          nomor_urut: urutSpk,
          item_id: idItem,
          desain_index: desainIndex,
          label_desain: desainSpec.label_desain,
          jenis_spk: desainSpec.jenis_spk,
        });
      });
    });

    const total_harga = items.reduce(
      (total, item) =>
        total +
        item.varian.reduce((subtotal, varian) => subtotal + varian.subtotal, 0),
      0,
    );

    const rantai: StatusPesanan[] =
      spec.status === 'BATAL'
        ? ['DRAFT', 'SPK_DIKIRIM', 'BATAL']
        : URUTAN_STATUS.slice(0, URUTAN_STATUS.indexOf(spec.status) + 1);

    const log: LogStatus[] = rantai.map((status, i) => ({
      id: ++logId,
      pesanan_id: id,
      status_lama: i === 0 ? '' : rantai[i - 1],
      status_baru: status,
      keterangan: i === 0 ? 'Pesanan dibuat' : `Status diubah ke ${status}`,
      created_at: iso(day, 8 + i),
    }));

    const kendala: Kendala[] | undefined = spec.kendala
      ? [
          {
            id: ++kendalaId,
            pesanan_id: id,
            jenis: spec.kendala.jenis,
            catatan: spec.kendala.catatan,
            estimasi_mundur_hari: spec.kendala.estimasi_mundur_hari,
            created_at: iso(day, 13),
          },
        ]
      : undefined;

    return {
      id,
      nomor,
      customer: customersSeed[spec.customer],
      status: spec.status,
      deadline: spec.deadline,
      catatan: spec.catatan,
      designer: spec.designer ?? '',
      status_bayar:
        spec.status === 'DIAMBIL'
          ? 'LUNAS'
          : spec.status === 'SELESAI'
            ? 'DP'
            : 'BELUM_BAYAR',
      dibayar:
        spec.status === 'DIAMBIL'
          ? total_harga
          : spec.status === 'SELESAI'
            ? Math.round(total_harga / 2)
            : 0,
      metode_bayar:
        spec.status === 'DIAMBIL'
          ? 'TRANSFER'
          : spec.status === 'SELESAI'
            ? 'TUNAI'
            : undefined,
      catatan_bayar: spec.status === 'DIAMBIL' ? 'Lunas transfer' : '',
      total_harga,
      items,
      spk,
      log,
      kendala,
      created_at: iso(day, 8),
      updated_at: log[log.length - 1].created_at,
    };
  });
}

const PESANAN_SEED: Pesanan[] = bangunPesanan(SPECS);

export interface SeedDatabase {
  customers: Customer[];
  kain: BahanKain[];
  pesanan: Pesanan[];
  log: LogStatus[];
}

/** Selalu mengembalikan salinan baru supaya state MSW bisa di-reset. */
export function seedDatabase(): SeedDatabase {
  const customers = structuredClone(customersSeed);
  const kain = structuredClone(kainSeed);
  const pesanan = structuredClone(PESANAN_SEED);

  for (const satuPesanan of pesanan) {
    satuPesanan.customer =
      customers.find((c) => c.id === satuPesanan.customer.id) ?? satuPesanan.customer;

    for (const item of satuPesanan.items) {
      item.kain = kain.find((k) => k.id === item.kain.id) ?? item.kain;
    }
  }

  return { customers, kain, pesanan, log: pesanan.flatMap((p) => p.log) };
}