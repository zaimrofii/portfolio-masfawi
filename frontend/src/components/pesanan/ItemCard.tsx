import { Plus, Trash2 } from "lucide-react";

import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import type { BahanKain } from "@/api/types";
import { Button, Input, Select } from "@/components/ui";

import { DesainCard } from "./DesainCard";
import { defaultDesain } from "./skema";
import type { PesananFormValues } from "./skema";

const OPSI_JENIS = [
  { value: "KAOS", label: "Kaos" },
  { value: "KEMEJA", label: "Kemeja" },
  { value: "POLO", label: "Polo" },
];

const OPSI_LENGAN = [
  { value: "PENDEK", label: "Pendek" },
  { value: "PANJANG", label: "Panjang" },
];

interface Props {
  form: UseFormReturn<PesananFormValues>;
  index: number;
  kains: BahanKain[];
  bisaHapus: boolean;
  onHapus: () => void;
}

export function ItemCard({ form, index, kains, bisaHapus, onHapus }: Props) {
  const { register, watch, formState, control } = form;
  const itemErrors = formState.errors.items?.[index];

  const { fields, append, remove } = useFieldArray({
    control,
    name: `items.${index}.desain`,
  });

  const kainId = watch(`items.${index}.kain_id`);
  const kain = kains.find((k) => String(k.id) === kainId);

  return (
    <div className="space-y-4 rounded-card border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-foreground">
          Item {index + 1}
        </p>
        <Button variant="ghost" onClick={onHapus} disabled={!bisaHapus}>
          <Trash2 size={16} className="shrink-0" aria-hidden="true" />
          Hapus
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Jenis"
          {...register(`items.${index}.jenis`)}
          options={OPSI_JENIS}
          error={itemErrors?.jenis?.message}
        />

        <Select
          label="Kain"
          {...register(`items.${index}.kain_id`)}
          error={itemErrors?.kain_id?.message}
          hint={
            kain
              ? `Stok ${kain.stok_meter} m`
              : "Harga satuan diisi di langkah 3"
          }
        >
          <option value="">Pilih kain</option>
          {kains.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama} — {k.warna}
            </option>
          ))}
        </Select>

        <Select
          label="Lengan"
          {...register(`items.${index}.lengan`)}
          options={OPSI_LENGAN}
          error={itemErrors?.lengan?.message}
        />

        <Input
          label="Warna"
          placeholder="Mis. Hitam, Navy"
          {...register(`items.${index}.warna`)}
          error={itemErrors?.warna?.message}
        />

        <label className="flex min-h-12 items-center gap-3 text-base text-foreground hover:bg-gray-200 rounded-md px-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 accent-primary"
            {...register(`items.${index}.saku`)}
          />
          Pakai saku
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold text-foreground">
            Desain / SPK ({fields.length})
          </p>
          <Button
            variant="secondary"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#ffffff",
              cursor: "pointer",
            }}
            onClick={() => append(defaultDesain())}
          >
            <Plus size={16} className="shrink-0 " aria-hidden="true" />
            Tambah Desain
          </Button>
        </div>

        {fields.map((field, desainIndex) => (
          <DesainCard
            key={field.id}
            form={form}
            itemIndex={index}
            desainIndex={desainIndex}
            bisaHapus={fields.length > 1}
            onHapus={() => remove(desainIndex)}
          />
        ))}
      </div>
    </div>
  );
}
