import type {
  DesainItem,
  ItemPesanan,
  Pesanan,
  SpkProduksi,
} from '@/api/types';

export interface SpkTerurai {
  spk: SpkProduksi;
  item: ItemPesanan;
  desain: DesainItem;
}

/** Gabungkan SPK (view turunan) dengan item + desain aslinya. */
export function resolveSpk(
  spk: SpkProduksi,
  items: ItemPesanan[],
): SpkTerurai | null {
  const item = items.find((baris) => baris.id === spk.item_id);
  if (!item) return null;

  const desain = item.desain[spk.desain_index] ?? item.desain[0];
  if (!desain) return null;

  return { spk, item, desain };
}

export function resolveSemuaSpk(pesanan: Pesanan): SpkTerurai[] {
  return pesanan.spk
    .map((spk) => resolveSpk(spk, pesanan.items))
    .filter((hasil): hasil is SpkTerurai => hasil !== null);
}

export function jumlahPcsItem(item: ItemPesanan): number {
  return item.varian.reduce((total, varian) => total + varian.jumlah, 0);
}