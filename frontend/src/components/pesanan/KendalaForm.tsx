import { useState } from 'react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { useCatatKendala } from '@/hooks/useCatatKendala';

const OPSI_JENIS = [
  { value: 'SDM', label: 'SDM' },
  { value: 'MESIN', label: 'Mesin' },
  { value: 'BAHAN', label: 'Bahan' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

interface Props {
  pesananId: number;
  onSelesai: () => void;
}

export function KendalaForm({ pesananId, onSelesai }: Props) {
  const toast = useToast();
  const catatKendala = useCatatKendala();

  const [jenis, setJenis] = useState('MESIN');
  const [catatan, setCatatan] = useState('');
  const [estimasi, setEstimasi] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const simpan = async () => {
    if (!catatan.trim()) {
      setError('Catatan kendala wajib diisi');
      return;
    }

    const estimasiAngka = Number(estimasi) || 0;
    if (estimasiAngka < 0) {
      setError('Estimasi tidak boleh negatif');
      return;
    }

    setError(null);

    try {
      await catatKendala.mutateAsync({
        id: pesananId,
        payload: {
          jenis,
          catatan: catatan.trim(),
          estimasi_mundur_hari: estimasiAngka,
        },
      });
      toast.sukses('Kendala dicatat');
      setCatatan('');
      setEstimasi('0');
      onSelesai();
    } catch {
      toast.error('Gagal mencatat kendala');
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <Select
        label="Jenis kendala"
        value={jenis}
        onChange={(event) => setJenis(event.target.value)}
        options={OPSI_JENIS}
      />

      <Textarea
        label="Catatan"
        placeholder="Apa yang menghambat produksi?"
        value={catatan}
        onChange={(event) => setCatatan(event.target.value)}
        error={error ?? undefined}
      />

      <Input
        label="Estimasi mundur (hari)"
        type="number"
        min={0}
        value={estimasi}
        onChange={(event) => setEstimasi(event.target.value)}
        hint="Isi 0 bila tidak ada pergeseran"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void simpan()} loading={catatKendala.isPending}>
          Simpan Kendala
        </Button>
        <Button variant="ghost" onClick={onSelesai} disabled={catatKendala.isPending}>
          Batal
        </Button>
      </div>
    </div>
  );
}