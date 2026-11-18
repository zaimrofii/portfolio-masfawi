import { useNavigate, useParams } from 'react-router-dom';

import { PesananFormWizard } from '@/components/pesanan/PesananFormWizard';
import { Button, EmptyState } from '@/components/ui';
import { usePesananDetail } from '@/hooks/usePesananDetail';
import { STATUS_MAP } from '@/lib/status';

const STATUS_BOLEH_EDIT = ['DRAFT', 'REVISI'];

export function EditPesanan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pesananId = Number(id);

  const { data, isLoading, isError, error, refetch } =
    usePesananDetail(pesananId);

  if (isLoading) {
    return <p className="text-sm xl:text-base text-muted-foreground">Memuat…</p>;
  }

  const kodeError = (error as { response?: { status?: number } } | null)
    ?.response?.status;

  if (kodeError === 404 || (!isError && !data)) {
    return (
      <EmptyState
        judul="Pesanan tidak ditemukan"
        deskripsi="Pesanan mungkin sudah dihapus atau nomor tidak valid."
        aksi={<Button onClick={() => navigate('/pesanan')}>Kembali</Button>}
      />
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        judul="Gagal memuat pesanan"
        deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
        aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
      />
    );
  }

  if (!STATUS_BOLEH_EDIT.includes(data.status)) {
    return (
      <EmptyState
        judul="Pesanan tidak bisa diedit pada status ini"
        deskripsi={`Status saat ini: ${STATUS_MAP[data.status].label}. Edit hanya tersedia untuk Draft dan Revisi.`}
        aksi={
          <Button onClick={() => navigate(`/pesanan/${data.id}`)}>
            Kembali ke Detail
          </Button>
        }
      />
    );
  }

  return (
    <PesananFormWizard
      mode="edit"
      pesananAwal={data}
      pesananId={data.id}
    />
  );
}