import { delay, http, HttpResponse } from 'msw';

import type {
  BahanKain,
  Customer,
  CustomerCreate,
  ItemPesanan,
  KainCreate,
  Kendala,
  KendalaCreate,
  LogStatus,
  Pesanan,
  PesananCreate,
  SpkProduksi,
  StatusPesanan,
} from '../api/types';
import { generateNomorSpk } from '@/lib/spkNomor';

import { seedDatabase } from './data/pesanan';
import type { SeedDatabase } from './data/pesanan';

const BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

const JEDA = 150;

/** Transisi status yang diizinkan (cermin aturan backend nanti). */
const STATUS_MAP: Record<StatusPesanan, StatusPesanan[]> = {
  DRAFT: ['SPK_DIKIRIM', 'BATAL'],
  SPK_DIKIRIM: ['REVISI', 'DISETUJUI', 'BATAL'],
  REVISI: ['SPK_DIKIRIM', 'DISETUJUI', 'BATAL'],
  DISETUJUI: ['PRODUKSI', 'REVISI', 'BATAL'],
  PRODUKSI: ['SELESAI', 'BATAL'],
  SELESAI: ['DIAMBIL'],
  DIAMBIL: [],
  BATAL: [],
};

const STATUS_AKTIF: StatusPesanan[] = [
  'DRAFT',
  'SPK_DIKIRIM',
  'REVISI',
  'DISETUJUI',
  'PRODUKSI',
];

/** In-memory store — reset dengan memanggil seedDatabase() lagi. */
let db: SeedDatabase = seedDatabase();

const seq = { item: 0, spk: 0, varian: 0, log: 0, kendala: 0 };

function maxId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => (row.id > max ? row.id : max), 0);
}

function initSeq(): void {
  const items = db.pesanan.flatMap((p) => p.items);
  const semuaSpk = db.pesanan.flatMap((p) => p.spk);
  seq.item = maxId(items);
  seq.spk = maxId(semuaSpk);
  seq.varian = maxId(items.flatMap((i) => i.varian));
  seq.log = maxId(db.log);
  seq.kendala = maxId(db.pesanan.flatMap((p) => p.kendala ?? []));
}

initSeq();

function sekarang(): string {
  return new Date().toISOString();
}

function nomorBaru(): string {
  return `PS-20261116-${String(db.pesanan.length + 1).padStart(3, '0')}`;
}

function cariPesanan(id: number): Pesanan | undefined {
  return db.pesanan.find((p) => p.id === id);
}

function buatItem(
  pesananId: number,
  payload: PesananCreate['items'][number],
): ItemPesanan {
  const kain = db.kain.find((k) => k.id === payload.kain_id) ?? db.kain[0];
  const idItem = ++seq.item;

  const varian = payload.varian.map((v) => ({
    id: ++seq.varian,
    item_id: idItem,
    kategori: v.kategori,
    ukuran: v.ukuran,
    jumlah: v.jumlah,
    harga_satuan: v.harga_satuan,
    subtotal: v.jumlah * v.harga_satuan,
  }));

  return {
    id: idItem,
    pesanan_id: pesananId,
    jenis: payload.jenis,
    kain,
    lengan: payload.lengan,
    warna: payload.warna,
    saku: payload.saku,
    varian,
    desain: payload.desain.map((desain) => ({
      label_desain: desain.label_desain,
      jenis_spk: desain.jenis_spk,
      gambar_depan: desain.gambar_depan ?? null,
      gambar_belakang: desain.gambar_belakang ?? null,
      gambar_desain: desain.gambar_desain ?? null,
      bordir_titik: desain.bordir_titik ?? null,
      bordir_keterangan: desain.bordir_keterangan ?? '',
      spesifikasi: desain.spesifikasi ?? [],
    })),
    spesifikasi: payload.spesifikasi ?? [],
  };
}

/** 1 desain -> 1 SPK (view turunan: id + index + label saja). */
function buatSpk(
  nomorPesanan: string,
  itemId: number,
  desainIndex: number,
  desain: PesananCreate['items'][number]['desain'][number],
  urut: number,
): SpkProduksi {
  return {
    id: ++seq.spk,
    nomor_spk: generateNomorSpk(nomorPesanan, urut),
    nomor_urut: urut,
    item_id: itemId,
    desain_index: desainIndex,
    label_desain: desain.label_desain,
    jenis_spk: desain.jenis_spk,
  };
}

function bangunItemsDanSpk(
  pesananId: number,
  nomorPesanan: string,
  daftarItem: PesananCreate['items'],
): { items: ItemPesanan[]; spk: SpkProduksi[] } {
  const items: ItemPesanan[] = [];
  const spk: SpkProduksi[] = [];
  let urut = 0;

  for (const payloadItem of daftarItem) {
    const item = buatItem(pesananId, payloadItem);
    items.push(item);

    payloadItem.desain.forEach((desain, desainIndex) => {
      urut += 1;
      spk.push(buatSpk(nomorPesanan, item.id, desainIndex, desain, urut));
    });
  }

  return { items, spk };
}

function hitungTotalItem(daftarItem: ItemPesanan[]): number {
  return daftarItem.reduce(
    (total, item) =>
      total + item.varian.reduce((sub, v) => sub + v.subtotal, 0),
    0,
  );
}

function tambahLog(
  pesanan: Pesanan,
  statusLama: StatusPesanan | '',
  statusBaru: StatusPesanan,
  keterangan: string,
): LogStatus {
  const entry: LogStatus = {
    id: ++seq.log,
    pesanan_id: pesanan.id,
    status_lama: statusLama,
    status_baru: statusBaru,
    keterangan,
    created_at: sekarang(),
  };

  pesanan.log.push(entry);
  db.log.push(entry);
  pesanan.updated_at = entry.created_at;

  return entry;
}export const handlers = [
  http.get(`${BASE}/dashboard/`, async () => {
    await delay(JEDA);

    const aktif = db.pesanan.filter((p) => STATUS_AKTIF.includes(p.status));
    const deadline_dekat = [...aktif]
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 5);
    const kendala = aktif
      .flatMap((p) =>
        (p.kendala ?? []).map((k) => ({ ...k, pesanan_nomor: p.nomor })),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return HttpResponse.json({
      aktif: aktif.length,
      produksi: db.pesanan.filter((p) => p.status === 'PRODUKSI').length,
      menunggu: db.pesanan.filter((p) => p.status === 'DISETUJUI').length,
      deadline_dekat,
      kendala,
    });
  }),

  http.get(`${BASE}/antrian/`, async () => {
    await delay(JEDA);

    const produksi = db.pesanan.filter((p) => p.status === 'PRODUKSI');
    const menunggu = db.pesanan
      .filter((p) => p.status === 'DISETUJUI')
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    return HttpResponse.json({
      sedang_dikerjakan: produksi[0] ?? null,
      menunggu,
    });
  }),
  http.post(`${BASE}/antrian/mulai-berikutnya/`, async () => {
    await delay(JEDA);

    const produksi = db.pesanan.find((p) => p.status === 'PRODUKSI');
    if (produksi) {
      return HttpResponse.json(
        { detail: 'Masih ada pesanan produksi aktif (' + produksi.nomor + ')' },
        { status: 400 },
      );
    }

    const berikutnya = db.pesanan
      .filter((p) => p.status === 'DISETUJUI')
      .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];

    if (!berikutnya) {
      return HttpResponse.json(
        { detail: 'Tidak ada pesanan DISETUJUI yang menunggu' },
        { status: 404 },
      );
    }

    berikutnya.status = 'PRODUKSI';
    tambahLog(berikutnya, 'DISETUJUI', 'PRODUKSI', 'Mulai produksi');

    return HttpResponse.json(berikutnya);
  }),

  http.get(`${BASE}/pesanan/`, async ({ request }) => {
    await delay(JEDA);

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const q = (url.searchParams.get('q') ?? '').toLowerCase().trim();

    let hasil = [...db.pesanan];
    if (status && status !== 'SEMUA') {
      hasil = hasil.filter((p) => p.status === status);
    }
    if (q) {
      hasil = hasil.filter(
        (p) =>
          p.nomor.toLowerCase().includes(q) ||
          p.customer.nama.toLowerCase().includes(q),
      );
    }
    hasil.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return HttpResponse.json(hasil);
  }),

  http.get(`${BASE}/pesanan/:id/`, async ({ params }) => {
    await delay(JEDA);

    const pesanan = cariPesanan(Number(params.id));
    if (!pesanan) {
      return HttpResponse.json(
        { detail: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }

    return HttpResponse.json(pesanan);
  }),

  http.post(`${BASE}/pesanan/`, async ({ request }) => {
    await delay(JEDA);

    const payload = (await request.json()) as PesananCreate;
    const customer = db.customers.find((c) => c.id === payload.customer_id);
    if (!customer) {
      return HttpResponse.json(
        { detail: 'Customer tidak ditemukan' },
        { status: 400 },
      );
    }

    const id = maxId(db.pesanan) + 1;
    const nomor = nomorBaru();
    const { items, spk } = bangunItemsDanSpk(id, nomor, payload.items);
    const created = sekarang();

    const pesanan: Pesanan = {
      id,
      nomor,
      customer,
      status: 'DRAFT',
      deadline: payload.deadline,
      catatan: payload.catatan,
      designer: payload.designer ?? '',
      status_bayar: 'BELUM_BAYAR',
      dibayar: 0,
      total_harga: hitungTotalItem(items),
      items,
      spk,
      log: [],
      created_at: created,
      updated_at: created,
    };

    db.pesanan.push(pesanan);
    tambahLog(pesanan, '', 'DRAFT', 'Pesanan dibuat');

    return HttpResponse.json(pesanan, { status: 201 });
  }),

  http.put(`${BASE}/pesanan/:id/`, async ({ params, request }) => {
    await delay(JEDA);

    const pesanan = cariPesanan(Number(params.id));
    if (!pesanan) {
      return HttpResponse.json(
        { detail: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }

    const payload = (await request.json()) as Partial<PesananCreate>;

    if (payload.customer_id) {
      const customer = db.customers.find((c) => c.id === payload.customer_id);
      if (!customer) {
        return HttpResponse.json(
          { detail: 'Customer tidak ditemukan' },
          { status: 400 },
        );
      }
      pesanan.customer = customer;
    }
    if (payload.deadline) pesanan.deadline = payload.deadline;
    if (payload.catatan !== undefined) pesanan.catatan = payload.catatan;
    if (payload.designer !== undefined) pesanan.designer = payload.designer;
    if (payload.items) {
      const { items, spk } = bangunItemsDanSpk(
        pesanan.id,
        pesanan.nomor,
        payload.items,
      );
      pesanan.items = items;
      pesanan.spk = spk;
      pesanan.total_harga = hitungTotalItem(items);
    }

    pesanan.updated_at = sekarang();
    return HttpResponse.json(pesanan);
  }),

  http.patch(`${BASE}/pesanan/:id/bayar/`, async ({ params, request }) => {
    await delay(JEDA);

    const pesanan = cariPesanan(Number(params.id));
    if (!pesanan) {
      return HttpResponse.json(
        { detail: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      nominal: number;
      metode?: 'TUNAI' | 'TRANSFER';
      catatan?: string;
      lunas?: boolean;
    };

    const nominal = Number(body.nominal);
    if (!Number.isFinite(nominal) || nominal <= 0) {
      return HttpResponse.json(
        { detail: 'Nominal harus lebih dari 0' },
        { status: 400 },
      );
    }

    const sisa = pesanan.total_harga - pesanan.dibayar;
    if (nominal > sisa) {
      return HttpResponse.json(
        { detail: 'Nominal melebihi sisa tagihan' },
        { status: 400 },
      );
    }

    pesanan.dibayar = Math.min(
      pesanan.total_harga,
      pesanan.dibayar + nominal,
    );

    if (body.lunas || pesanan.dibayar >= pesanan.total_harga) {
      pesanan.status_bayar = 'LUNAS';
      pesanan.dibayar = pesanan.total_harga;
    } else if (pesanan.dibayar > 0) {
      pesanan.status_bayar = 'DP';
    } else {
      pesanan.status_bayar = 'BELUM_BAYAR';
    }

    if (body.metode) pesanan.metode_bayar = body.metode;
    if (body.catatan !== undefined) pesanan.catatan_bayar = body.catatan;

    pesanan.updated_at = sekarang();
    return HttpResponse.json(pesanan);
  }),

  http.patch(`${BASE}/pesanan/:id/status/`, async ({ params, request }) => {
    await delay(JEDA);

    const pesanan = cariPesanan(Number(params.id));
    if (!pesanan) {
      return HttpResponse.json(
        { detail: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      status: StatusPesanan;
      keterangan?: string;
    };
    const diizinkan = STATUS_MAP[pesanan.status] ?? [];
    if (!diizinkan.includes(body.status)) {
      return HttpResponse.json(
        { detail: `Transisi ${pesanan.status} ke ${body.status} tidak diizinkan` },
        { status: 400 },
      );
    }

    const statusLama = pesanan.status;
    pesanan.status = body.status;
    tambahLog(pesanan, statusLama, body.status, body.keterangan ?? '');

    return HttpResponse.json(pesanan);
  }),

  http.post(`${BASE}/pesanan/:id/kendala/`, async ({ params, request }) => {
    await delay(JEDA);

    const pesanan = cariPesanan(Number(params.id));
    if (!pesanan) {
      return HttpResponse.json(
        { detail: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }

    const payload = (await request.json()) as KendalaCreate;
    const kendala: Kendala = {
      id: ++seq.kendala,
      pesanan_id: pesanan.id,
      jenis: payload.jenis,
      catatan: payload.catatan,
      estimasi_mundur_hari: payload.estimasi_mundur_hari,
      created_at: sekarang(),
    };

    pesanan.kendala = [...(pesanan.kendala ?? []), kendala];
    pesanan.updated_at = kendala.created_at;

    return HttpResponse.json(kendala, { status: 201 });
  }),  http.get(`${BASE}/kain/`, async () => {
    await delay(JEDA);
    return HttpResponse.json(db.kain);
  }),

  http.post(`${BASE}/kain/`, async ({ request }) => {
    await delay(JEDA);

    const payload = (await request.json()) as KainCreate;
    const kain: BahanKain = {
      id: maxId(db.kain) + 1,
      ...payload,
      created_at: sekarang(),
    };
    db.kain.push(kain);

    return HttpResponse.json(kain, { status: 201 });
  }),

  http.put(`${BASE}/kain/:id/`, async ({ params, request }) => {
    await delay(JEDA);

    const kain = db.kain.find((k) => k.id === Number(params.id));
    if (!kain) {
      return HttpResponse.json({ detail: 'Kain tidak ditemukan' }, { status: 404 });
    }

    Object.assign(kain, (await request.json()) as Partial<KainCreate>);
    return HttpResponse.json(kain);
  }),

  http.get(`${BASE}/customer/`, async ({ request }) => {
    await delay(JEDA);

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase().trim();
    const hasil = q
      ? db.customers.filter(
          (c) =>
            c.nama.toLowerCase().includes(q) ||
            c.no_wa.toLowerCase().includes(q),
        )
      : db.customers;

    return HttpResponse.json(hasil);
  }),

  http.post(`${BASE}/customer/`, async ({ request }) => {
    await delay(JEDA);

    const payload = (await request.json()) as CustomerCreate;
    const customer: Customer = {
      id: maxId(db.customers) + 1,
      ...payload,
      created_at: sekarang(),
    };
    db.customers.push(customer);

    return HttpResponse.json(customer, { status: 201 });
  }),

  http.put(`${BASE}/customer/:id/`, async ({ params, request }) => {
    await delay(JEDA);

    const customer = db.customers.find((c) => c.id === Number(params.id));
    if (!customer) {
      return HttpResponse.json(
        { detail: 'Customer tidak ditemukan' },
        { status: 404 },
      );
    }

    Object.assign(customer, (await request.json()) as Partial<CustomerCreate>);
    return HttpResponse.json(customer);
  }),

  http.post(`${BASE}/backup/`, async () => {
    await delay(JEDA);
    return HttpResponse.json({ ok: true, message: 'Backup dummy (mock)' });
  }),

  http.get(`${BASE}/pesanan/:id/spk.pdf`, async () => {
    await delay(JEDA);
    return HttpResponse.json(
      { detail: 'PDF belum tersedia (backend belum ada)' },
      { status: 404 },
    );
  }),

  http.get(`${BASE}/pesanan/:id/invoice.pdf`, async () => {
    await delay(JEDA);
    return HttpResponse.json(
      { detail: 'PDF belum tersedia (backend belum ada)' },
      { status: 404 },
    );
  }),
];