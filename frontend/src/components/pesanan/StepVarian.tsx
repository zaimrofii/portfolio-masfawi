import { ImagePlus, Plus, Trash2 } from "lucide-react";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { Button, Input, Textarea } from "@/components/ui";
import { formatRupiah } from "@/lib/format";
import { kompresGambar } from "@/lib/gambar";
import { subtotalVarian } from "@/lib/kalkulasi";

import { TotalSummary } from "./TotalSummary";
import { VarianRow } from "./VarianRow";
import { defaultVarian } from "./skema";
import type { PesananFormValues } from "./skema";

interface Props {
  form: UseFormReturn<PesananFormValues>;
}

function SlotCloseUp({
  nilai,
  onUbah,
}: {
  nilai: string;
  onUbah: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  const pilih = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setMemuat(true);

    try {
      onUbah(await kompresGambar(file));
    } catch (kesalahan) {
      setError(
        kesalahan instanceof Error
          ? kesalahan.message
          : "Gagal memproses gambar",
      );
    } finally {
      setMemuat(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (nilai) {
    return (
      <div className="space-y-2">
        <img
          src={nilai}
          alt="Gambar close-up desain"
          className="aspect-video w-[400px] rounded-lg border border-border bg-muted/40 object-contain"
        />
        <Button variant="ghost" onClick={() => onUbah(null)}>
          <Trash2 size={16} className="shrink-0" aria-hidden="true" />
          Hapus Desain
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="flex min-h-20 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input p-3 text-sm text-muted-foreground">
        <ImagePlus size={18} className="shrink-0" aria-hidden="true" />
        {memuat ? "Memproses…" : "Upload gambar close-up (maks 5 MB)"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void pilih(event)}
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function DesainRingkas({
  form,
  itemIndex,
  desainIndex,
}: {
  form: UseFormReturn<PesananFormValues>;
  itemIndex: number;
  desainIndex: number;
}) {
  const { register, watch, setValue, formState } = form;
  const desain = watch(`items.${itemIndex}.desain.${desainIndex}`);
  const errors = formState.errors.items?.[itemIndex]?.desain?.[desainIndex];

  const spesifikasi = useFieldArray({
    control: form.control,
    name: `items.${itemIndex}.desain.${desainIndex}.spesifikasi`,
  });

  const closeUp = desain?.gambar_desain ?? "";
  const tampilCloseUp = (desain?.jenis_spk ?? "POLOS") !== "POLOS";

  return (
    <div className="space-y-3 rounded-lg bg-muted/40 p-3">
      <div className="flex flex-wrap items-center gap-3">
        {desain?.gambar_depan ? (
          <img
            src={desain.gambar_depan}
            alt={`Depan ${desain?.label_desain ?? ""}`}
            className="h-16 w-24 rounded border border-border bg-background object-contain"
          />
        ) : null}

        <div>
          <p className="text-base font-medium text-foreground">
            {desain?.label_desain || "(belum diberi label)"}
          </p>
          <p className="text-sm text-muted-foreground">
            Jenis SPK: {desain?.jenis_spk ?? "POLOS"}
          </p>
        </div>
      </div>

      {tampilCloseUp ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Desain Sablon/bordir
          </p>
          <SlotCloseUp
            nilai={closeUp}
            onUbah={(nilai) =>
              setValue(
                `items.${itemIndex}.desain.${desainIndex}.gambar_desain`,
                nilai ?? "",
              )
            }
          />
        </div>
      ) : null}

      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            Spesifikasi manual desain
          </p>
          <Button
            variant="ghost"
            onClick={() => spesifikasi.append({ label: "", nilai: "" })}
          >
            <Plus size={16} className="shrink-0" aria-hidden="true" />
            Tambah Baris
          </Button>
        </div>

        {spesifikasi.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Mis. posisi sablon; boleh dikosongkan.
          </p>
        ) : null}

        {spesifikasi.fields.map((field, barisIndex) => (
          <div key={field.id} className="flex flex-wrap items-start gap-2">
            <div className="min-w-36 flex-1">
              <Input
                placeholder="Label (mis. Posisi sablon)"
                {...register(
                  `items.${itemIndex}.desain.${desainIndex}.spesifikasi.${barisIndex}.label`,
                )}
              />
            </div>
            <div className="min-w-36 flex-1">
              <Input
                placeholder="Nilai (mis. Dada kiri)"
                {...register(
                  `items.${itemIndex}.desain.${desainIndex}.spesifikasi.${barisIndex}.nilai`,
                )}
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => spesifikasi.remove(barisIndex)}
              aria-label="Hapus baris spesifikasi desain"
            >
              <Trash2 size={16} className="shrink-0" aria-hidden="true" />
            </Button>
          </div>
        ))}

        {errors?.bordir_keterangan?.message ? (
          <p className="text-sm text-danger">
            {errors.bordir_keterangan.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ItemSection({
  form,
  itemIndex,
}: {
  form: UseFormReturn<PesananFormValues>;
  itemIndex: number;
}) {
  const item = form.watch(`items.${itemIndex}`);
  const itemErrors = form.formState.errors.items?.[itemIndex];
  const varianErrors = itemErrors?.varian;

  const varian = useFieldArray({
    control: form.control,
    name: `items.${itemIndex}.varian`,
  });

  const spesifikasi = useFieldArray({
    control: form.control,
    name: `items.${itemIndex}.spesifikasi`,
  });

  const totalPcs = (item?.varian ?? []).reduce(
    (total, baris) => total + (Number(baris?.jumlah) || 0),
    0,
  );
  const totalRupiah = (item?.varian ?? []).reduce(
    (total, baris) =>
      total +
      subtotalVarian(
        Number(baris?.jumlah) || 0,
        Number(baris?.harga_satuan) || 0,
      ),
    0,
  );

  return (
    <div className="space-y-4 rounded-card border border-border p-4">
      <p className="text-lg font-semibold text-foreground">
        Item {itemIndex + 1} — {item?.jenis ?? "Item"}
      </p>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            A. Varian Ukuran
          </p>
          <Button
            variant="secondary"
            onClick={() => varian.append(defaultVarian())}
          >
            <Plus size={16} className="shrink-0" aria-hidden="true" />
            Tambah Varian
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-base">
            <thead className="text-sm text-muted-foreground">
              <tr>
                <th className="px-2 py-2 font-medium">Kategori</th>
                <th className="px-2 py-2 font-medium">Ukuran</th>
                <th className="px-2 py-2 font-medium">Jumlah</th>
                <th className="px-2 py-2 font-medium">Harga Satuan</th>
                <th className="px-2 py-2 font-medium">Subtotal</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {varian.fields.map((field, varianIndex) => (
                <VarianRow
                  key={field.id}
                  form={form}
                  itemIndex={itemIndex}
                  varianIndex={varianIndex}
                  errorKategori={varianErrors?.[varianIndex]?.kategori?.message}
                  errorUkuran={varianErrors?.[varianIndex]?.ukuran?.message}
                  errorJumlah={varianErrors?.[varianIndex]?.jumlah?.message}
                  errorHarga={
                    varianErrors?.[varianIndex]?.harga_satuan?.message
                  }
                  bisaHapus={varian.fields.length > 1}
                  onHapus={() => varian.remove(varianIndex)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          Total item: {totalPcs} pcs · {formatRupiah(totalRupiah)}
        </p>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            B. Spesifikasi Item (opsional)
          </p>
          <Button
            variant="ghost"
            onClick={() => spesifikasi.append({ label: "", nilai: "" })}
          >
            <Plus size={16} className="shrink-0" aria-hidden="true" />
            Tambah Baris
          </Button>
        </div>

        {spesifikasi.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada spesifikasi item.
          </p>
        ) : null}

        {spesifikasi.fields.map((field, barisIndex) => (
          <div key={field.id} className="flex flex-wrap items-start gap-2">
            <div className="min-w-36 flex-1">
              <Input
                placeholder="Label (mis. Bahan)"
                {...form.register(
                  `items.${itemIndex}.spesifikasi.${barisIndex}.label`,
                )}
              />
            </div>
            <div className="min-w-36 flex-1">
              <Input
                placeholder="Nilai (mis. Cotton Combed 30s)"
                {...form.register(
                  `items.${itemIndex}.spesifikasi.${barisIndex}.nilai`,
                )}
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => spesifikasi.remove(barisIndex)}
              aria-label="Hapus baris spesifikasi item"
            >
              <Trash2 size={16} className="shrink-0" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-sm font-medium text-foreground">
          C. Daftar Desain ({item?.desain?.length ?? 0})
        </p>

        {(item?.desain ?? []).map((_desain, desainIndex) => (
          <DesainRingkas
            key={desainIndex}
            form={form}
            itemIndex={itemIndex}
            desainIndex={desainIndex}
          />
        ))}
      </div>
    </div>
  );
}

export function StepVarian({ form }: Props) {
  const items = form.watch("items") ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">3. Varian dan Spesifikasi</h2>

      {items.map((_item, itemIndex) => (
        <ItemSection key={itemIndex} form={form} itemIndex={itemIndex} />
      ))}

      <Textarea
        label="Catatan pesanan"
        placeholder="Permintaan khusus, referensi desain…"
        {...form.register("catatan")}
      />

      <TotalSummary form={form} />
    </div>
  );
}
