import { z } from 'zod';

import type { Pesanan, PesananCreate } from '@/api/types';

export const OPSI_JENIS_SPK = [
  { value: 'POLOS', label: 'Polos' },
  { value: 'SABLON', label: 'Sablon' },
  { value: 'BORDIR', label: 'Bordir' },
  { value: 'CAMPURAN', label: 'Campuran (sablon + bordir)' },
];

export function butuhBordir(jenisSpk: string): boolean {
  return jenisSpk === 'BORDIR' || jenisSpk === 'CAMPURAN';
}

export function hitungTitikBordir(nilai: string | undefined): number | null {
  if (!nilai) return 0;

  const angka = Number(nilai);
  if (!Number.isInteger(angka) || angka < 1 || angka > 999) return null;

  return angka;
}

export const varianFormSchema = z.object({
  kategori: z.enum(['DEWASA', 'ANAK']),
  ukuran: z.string().min(1, 'Ukuran wajib diisi'),
  jumlah: z
    .number({ message: 'Jumlah wajib diisi' })
    .int('Jumlah harus bilangan bulat')
    .min(1, 'Jumlah minimal 1'),
  /** Teks agar input bisa kosong (harga hasil nego). */
  harga_satuan: z
    .string()
    .min(1, 'Harga satuan wajib diisi')
    .refine((nilai) => Number(nilai) > 0, 'Harga satuan harus lebih dari 0'),
});

export const spesifikasiFormSchema = z.object({
  label: z.string(),
  nilai: z.string(),
});

export const desainFormSchema = z
  .object({
    label_desain: z.string().min(1, 'Label desain wajib diisi'),
    jenis_spk: z.enum(['POLOS', 'SABLON', 'BORDIR', 'CAMPURAN']),
    gambar_depan: z.string(),
    gambar_belakang: z.string(),
    gambar_desain: z.string(),
    bordir_titik: z.string(),
    bordir_keterangan: z
      .string()
      .max(200, 'Keterangan bordir maksimal 200 karakter'),
    spesifikasi: z.array(spesifikasiFormSchema),
  })
  .superRefine((desain, ctx) => {
    if (!butuhBordir(desain.jenis_spk)) return;

    const titik = hitungTitikBordir(desain.bordir_titik);

    if (titik === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['bordir_titik'],
        message: 'Jumlah titik bordir harus 1 sampai 999',
      });
      return;
    }

    if (titik > 0 && desain.bordir_keterangan.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['bordir_keterangan'],
        message: 'Keterangan bordir wajib diisi jika ada titik bordir',
      });
    }
  });

export const itemFormSchema = z.object({
  jenis: z.enum(['KAOS', 'KEMEJA', 'POLO']),
  kain_id: z.string().min(1, 'Kain wajib dipilih'),
  lengan: z.enum(['PENDEK', 'PANJANG']),
  warna: z.string().min(1, 'Warna wajib diisi'),
  saku: z.boolean(),
  varian: z.array(varianFormSchema).min(1, 'Minimal 1 varian per item'),
  desain: z.array(desainFormSchema).min(1, 'Minimal 1 desain per item'),
  spesifikasi: z.array(spesifikasiFormSchema),
});

export const pesananFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer wajib dipilih'),
  designer: z.string(),
  deadline: z.string().min(1, 'Deadline wajib diisi'),
  catatan: z.string(),
  items: z.array(itemFormSchema).min(1, 'Minimal 1 item'),
});

export type VarianFormValues = z.infer<typeof varianFormSchema>;
export type SpesifikasiFormValues = z.infer<typeof spesifikasiFormSchema>;
export type DesainFormValues = z.infer<typeof desainFormSchema>;
export type ItemFormValues = z.infer<typeof itemFormSchema>;
export type PesananFormValues = z.infer<typeof pesananFormSchema>;

export function defaultVarian(): VarianFormValues {
  return { kategori: 'DEWASA', ukuran: '', jumlah: 1, harga_satuan: '' };
}

export function defaultDesain(label = ''): DesainFormValues {
  return {
    label_desain: label,
    jenis_spk: 'POLOS',
    gambar_depan: '',
    gambar_belakang: '',
    gambar_desain: '',
    bordir_titik: '',
    bordir_keterangan: '',
    spesifikasi: [],
  };
}

export function defaultItem(kainId = ''): ItemFormValues {
  return {
    jenis: 'KAOS',
    kain_id: kainId,
    lengan: 'PENDEK',
    warna: '',
    saku: false,
    varian: [defaultVarian()],
    desain: [defaultDesain()],
    spesifikasi: [],
  };
}

export function deadlineDefault(): string {
  const tanggal = new Date();
  tanggal.setDate(tanggal.getDate() + 7);
  return tanggal.toISOString().slice(0, 10);
}

function bersihkanSpesifikasi(
  daftar: SpesifikasiFormValues[],
): { label: string; nilai: string }[] {
  return daftar
    .filter((baris) => baris.label.trim() !== '')
    .map((baris) => ({ label: baris.label.trim(), nilai: baris.nilai.trim() }));
}

/** Prefill wizard mode edit dari data pesanan (varian & desain ada di item). */
export function dariPesanan(pesanan: Pesanan): PesananFormValues {
  return {
    customer_id: String(pesanan.customer.id),
    designer: pesanan.designer ?? '',
    deadline: pesanan.deadline,
    catatan: pesanan.catatan,
    items: pesanan.items.map((item) => ({
      jenis: item.jenis,
      kain_id: String(item.kain.id),
      lengan: item.lengan,
      warna: item.warna,
      saku: item.saku,
      varian: item.varian.map((varian) => ({
        kategori: varian.kategori,
        ukuran: varian.ukuran,
        jumlah: varian.jumlah,
        harga_satuan: String(varian.harga_satuan),
      })),
      desain: item.desain.map((desain) => ({
        label_desain: desain.label_desain,
        jenis_spk: desain.jenis_spk,
        gambar_depan: desain.gambar_depan ?? '',
        gambar_belakang: desain.gambar_belakang ?? '',
        gambar_desain: desain.gambar_desain ?? '',
        bordir_titik: desain.bordir_titik ? String(desain.bordir_titik) : '',
        bordir_keterangan: desain.bordir_keterangan ?? '',
        spesifikasi: desain.spesifikasi.map((baris) => ({
          label: baris.label,
          nilai: baris.nilai,
        })),
      })),
      spesifikasi: (item.spesifikasi ?? []).map((baris) => ({
        label: baris.label,
        nilai: baris.nilai,
      })),
    })),
  };
}

export function kePayload(values: PesananFormValues): PesananCreate {
  return {
    customer_id: Number(values.customer_id),
    designer: values.designer.trim(),
    deadline: values.deadline,
    catatan: values.catatan,
    items: values.items.map((item) => ({
      jenis: item.jenis,
      kain_id: Number(item.kain_id),
      lengan: item.lengan,
      warna: item.warna,
      saku: item.saku,
      varian: item.varian.map((varian) => ({
        kategori: varian.kategori,
        ukuran: varian.ukuran,
        jumlah: Number(varian.jumlah),
        harga_satuan: Number(varian.harga_satuan),
      })),
      spesifikasi: bersihkanSpesifikasi(item.spesifikasi),
      desain: item.desain.map((desain) => {
        const titik = butuhBordir(desain.jenis_spk)
          ? (hitungTitikBordir(desain.bordir_titik) ?? 0)
          : 0;

        return {
          label_desain: desain.label_desain.trim(),
          jenis_spk: desain.jenis_spk,
          gambar_depan: desain.gambar_depan || null,
          gambar_belakang: desain.gambar_belakang || null,
          gambar_desain: desain.gambar_desain || null,
          bordir_titik: titik > 0 ? titik : null,
          bordir_keterangan: titik > 0 ? desain.bordir_keterangan.trim() : '',
          spesifikasi: bersihkanSpesifikasi(desain.spesifikasi),
        };
      }),
    })),
  };
}