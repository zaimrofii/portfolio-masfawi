import { Plus } from "lucide-react";

import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { Button, EmptyState } from "@/components/ui";
import { useKainList } from "@/hooks/useKainList";

import { ItemCard } from "./ItemCard";
import { defaultItem } from "./skema";
import type { PesananFormValues } from "./skema";

interface Props {
  form: UseFormReturn<PesananFormValues>;
  kainDefaultId: string;
}

export function StepItem({ form, kainDefaultId }: Props) {
  const kains = useKainList();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const tambahItem = () => append(defaultItem(kainDefaultId));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">2. Item Pesanan</h2>
        <Button
          variant="secondary"
          onClick={tambahItem}
          disabled={!kainDefaultId}
        >
          <Plus size={16} className="shrink-0" aria-hidden="true" />
          Tambah Item
        </Button>
      </div>

      {kains.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat daftar kain…</p>
      ) : null}

      {fields.length === 0 ? (
        <EmptyState
          judul="Belum ada item"
          deskripsi="Tambahkan minimal satu item pesanan."
          aksi={<Button onClick={tambahItem}>Tambah Item</Button>}
        />
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <ItemCard
              key={field.id}
              form={form}
              index={index}
              kains={kains.data ?? []}
              bisaHapus={fields.length > 1}
              onHapus={() => remove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
