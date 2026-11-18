/** Nomor SPK: `${nomor pesanan}-${urut}` (mis. PS-20261116-008-1). */
export function generateNomorSpk(nomorPesanan: string, urut: number): string {
  return `${nomorPesanan}-${urut}`;
}