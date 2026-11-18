import { Circle } from 'lucide-react';

import type { LogStatus } from '@/api/types';
import { formatTanggalWaktu } from '@/lib/format';
import { STATUS_MAP } from '@/lib/status';

interface Props {
  log: LogStatus[];
}

export function RiwayatStatus({ log }: Props) {
  const urut = [...log].sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (urut.length === 0) {
    return <p className="text-base text-muted-foreground">Belum ada riwayat.</p>;
  }

  return (
    <ol className="space-y-0">
      {urut.map((entry, index) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Circle
              size={10}
              className="mt-2 shrink-0 fill-primary text-primary"
              aria-hidden="true"
            />
            {index < urut.length - 1 ? (
              <span className="w-px flex-1 bg-border" aria-hidden="true" />
            ) : null}
          </div>

          <div className="pb-4">
            <p className="text-base text-foreground">
              {entry.status_lama
                ? `${STATUS_MAP[entry.status_lama].label} → `
                : ''}
              {STATUS_MAP[entry.status_baru].label}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatTanggalWaktu(entry.created_at)}
            </p>
            {entry.keterangan ? (
              <p className="text-sm text-muted-foreground">{entry.keterangan}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}