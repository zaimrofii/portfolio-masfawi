import type { LucideIcon } from 'lucide-react';
import {
  CheckCheck,
  CheckCircle2,
  FileDown,
  MessageSquare,
  PackageCheck,
  Pencil,
  Play,
  Receipt,
  Send,
  TriangleAlert,
  XCircle,
} from 'lucide-react';

import { useState } from 'react';

import type { Pesanan, StatusPesanan } from '@/api/types';
import { useNavigate } from 'react-router-dom';

import { Button, ConfirmDialog, useToast } from '@/components/ui';
import { useUbahStatus } from '@/hooks/useUbahStatus';
import { labelAksi, STATUS_MAP } from '@/lib/status';
import type { AksiId } from '@/lib/status';

const IKON: Record<AksiId, LucideIcon> = {
  export_spk: FileDown,
  kirim_spk: Send,
  edit: Pencil,
  batal: XCircle,
  revisi: MessageSquare,
  setujui: CheckCircle2,
  mulai_produksi: Play,
  kendala: TriangleAlert,
  selesai: CheckCheck,
  export_invoice: Receipt,
  diambil: PackageCheck,
};

const STATUS_TUJUAN: Partial<Record<AksiId, StatusPesanan>> = {
  kirim_spk: 'SPK_DIKIRIM',
  revisi: 'REVISI',
  setujui: 'DISETUJUI',
  mulai_produksi: 'PRODUKSI',
  selesai: 'SELESAI',
  diambil: 'DIAMBIL',
  batal: 'BATAL',
};

interface Konfirmasi {
  judul: string;
  pesan: string;
  confirmLabel: string;
  variant: 'primary' | 'danger';
}

const KONFIRMASI: Partial<Record<AksiId, Konfirmasi>> = {
  kirim_spk: {
    judul: 'Tandai SPK terkirim?',
    pesan: 'Customer dianggap sudah menerima SPK. Status berubah ke SPK Dikirim.',
    confirmLabel: 'Ya, kirim',
    variant: 'primary',
  },
  revisi: {
    judul: 'Minta revisi?',
    pesan: 'Pesanan kembali ke tahap revisi desain.',
    confirmLabel: 'Ya, revisi',
    variant: 'primary',
  },
  setujui: {
    judul: 'Setujui pesanan?',
    pesan: 'Pesanan akan masuk antrian produksi.',
    confirmLabel: 'Ya, setujui',
    variant: 'primary',
  },
  mulai_produksi: {
    judul: 'Mulai produksi?',
    pesan: 'Pesanan menjadi produksi aktif dan keluar dari daftar menunggu.',
    confirmLabel: 'Ya, mulai',
    variant: 'primary',
  },
  selesai: {
    judul: 'Selesaikan produksi?',
    pesan: 'Pesanan akan keluar dari antrian dan masuk ke tahap invoice.',
    confirmLabel: 'Ya, selesai',
    variant: 'primary',
  },
  diambil: {
    judul: 'Tandai sudah diambil?',
    pesan: 'Pesanan pindah ke arsip dan tidak bisa diubah lagi.',
    confirmLabel: 'Ya, diambil',
    variant: 'primary',
  },
  batal: {
    judul: 'Batalkan pesanan?',
    pesan: 'Pesanan dibatalkan dan tidak bisa dilanjutkan.',
    confirmLabel: 'Ya, batalkan',
    variant: 'danger',
  },
};

interface Props {
  pesanan: Pesanan;
  onCatatKendala: () => void;
}

export function AksiPanel({ pesanan, onCatatKendala }: Props) {
  const toast = useToast();
  const ubahStatus = useUbahStatus();
  const navigate = useNavigate();
  const [aksiAktif, setAksiAktif] = useState<AksiId | null>(null);

  const daftarAksi = STATUS_MAP[pesanan.status].aksi;
  const konfirmasi = aksiAktif ? KONFIRMASI[aksiAktif] : undefined;
  const statusTujuan = aksiAktif ? STATUS_TUJUAN[aksiAktif] : undefined;


  const jalankanAksi = (aksi: AksiId) => {
    if (aksi === 'edit') {
      navigate(`/pesanan/${pesanan.id}/edit`);
      return;
    }
    if (aksi === 'export_spk') {
      const pertama = pesanan.spk[0];

      if (!pertama) {
        toast.info('Belum ada SPK');
        return;
      }

      navigate(`/pesanan/${pesanan.id}/spk/${pertama.id}`);
      return;
    }
    if (aksi === 'export_invoice') {
      navigate(`/pesanan/${pesanan.id}/invoice`);
      return;
    }
    if (aksi === 'kendala') {
      onCatatKendala();
      return;
    }

    setAksiAktif(aksi);
  };

  const konfirmasiYa = async () => {
    if (!aksiAktif || !statusTujuan) return;

    try {
      await ubahStatus.mutateAsync({
        id: pesanan.id,
        status: statusTujuan,
      });
      toast.sukses('Status diperbarui');
      setAksiAktif(null);
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <div className="space-y-2">
      {daftarAksi.length === 0 ? (
        <p className="text-base text-muted-foreground">
          Tidak ada aksi untuk status ini.
        </p>
      ) : null}

      {daftarAksi.map((aksi) => {
        const Ikon = IKON[aksi];

        return (
          <Button
            key={aksi}
            fullWidth
            variant={
              aksi === 'batal'
                ? 'danger'
                : aksi === 'edit' || aksi === 'kendala'
                  ? 'secondary'
                  : 'primary'
            }
            loading={ubahStatus.isPending && aksiAktif === aksi}
            onClick={() => jalankanAksi(aksi)}
          >
            <Ikon size={16} className="shrink-0" aria-hidden="true" />
            {aksi === 'kirim_spk'
              ? 'Tandai SPK Terkirim'
              : aksi === 'export_spk'
                ? 'Lihat SPK'
                : aksi === 'export_invoice'
                  ? 'Lihat Invoice'
                  : labelAksi(aksi)}
          </Button>
        );
      })}

      <ConfirmDialog
        open={aksiAktif !== null}
        judul={konfirmasi?.judul ?? 'Konfirmasi'}
        pesan={konfirmasi?.pesan}
        confirmLabel={konfirmasi?.confirmLabel ?? 'Ya'}
        variant={konfirmasi?.variant ?? 'primary'}
        loading={ubahStatus.isPending}
        onConfirm={() => void konfirmasiYa()}
        onCancel={() => {
          if (!ubahStatus.isPending) setAksiAktif(null);
        }}
      />
    </div>
  );
}