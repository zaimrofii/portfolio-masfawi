import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  emptyText?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  getKey,
  onRowClick,
  stickyHeader = false,
  emptyText = 'Belum ada data',
  className,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-card border border-border',
        className,
      )}
    >
      <table className="w-full border-collapse text-left text-sm xl:text-base">
        <thead
          className={cn(
            'bg-muted/60 text-sm text-muted-foreground',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <tr>
            {columns.map((kolom) => (
              <th
                key={kolom.key}
                scope="col"
                className={cn('px-4 py-3 font-medium', kolom.className)}
              >
                {kolom.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((baris) => (
              <tr
                key={getKey(baris)}
                onClick={onRowClick ? () => onRowClick(baris) : undefined}
                className={cn(
                  'h-14 border-t border-border',
                  onRowClick && 'cursor-pointer hover:bg-muted/40',
                )}
              >
                {columns.map((kolom) => (
                  <td
                    key={kolom.key}
                    className={cn('px-4 py-2 align-middle', kolom.className)}
                  >
                    {kolom.render
                      ? kolom.render(baris)
                      : String(
                          (baris as Record<string, unknown>)[kolom.key] ?? '',
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}