export interface BarisVarian {
  jumlah: number;
  harga_satuan: number;
}

export interface PunyaVarian {
  varian: BarisVarian[];
}

export function subtotalVarian(jumlah: number, harga: number): number {
  return jumlah * harga;
}

export function hitungTotalItem(item: PunyaVarian): number {
  return item.varian.reduce(
    (total, varian) => total + subtotalVarian(varian.jumlah, varian.harga_satuan),
    0,
  );
}

export function hitungTotalSpk(daftarSpk: PunyaVarian[]): number {
  return daftarSpk.reduce((total, spk) => total + hitungTotalItem(spk), 0);
}

export function hitungTotalPesanan(pesanan: { spk: PunyaVarian[] }): number {
  return hitungTotalSpk(pesanan.spk);
}