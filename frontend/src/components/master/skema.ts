import { z } from 'zod';

export const kainFormSchema = z.object({
  nama: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  warna: z.string(),
  harga_per_meter: z
    .number({ message: 'Harga wajib diisi' })
    .min(0, 'Harga tidak boleh negatif'),
  stok_meter: z
    .number({ message: 'Stok wajib diisi' })
    .min(0, 'Stok tidak boleh negatif'),
  aktif: z.boolean(),
});

export type KainFormValues = z.infer<typeof kainFormSchema>;

export const customerFormSchema = z.object({
  nama: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  no_wa: z.string().min(10, 'Nomor minimal 10 digit'),
  alamat: z.string(),
  catatan: z.string(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;