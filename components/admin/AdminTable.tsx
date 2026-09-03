import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface Column<Row> {
  key: string;
  header: string;
  /** Rendu de la cellule ; reçoit la ligne complète. */
  cell: (row: Row) => ReactNode;
  align?: 'left' | 'right';
  /** Masque la colonne sur petit écran pour garder le tableau lisible. */
  hideOnMobile?: boolean;
}

interface AdminTableProps<Row> {
  columns: Array<Column<Row>>;
  rows: Row[];
  rowKey: (row: Row) => string;
  emptyLabel: string;
  caption?: string;
}

/** Tableau du back-office : défilement horizontal plutôt que troncature. */
export function AdminTable<Row>({
  columns,
  rows,
  rowKey,
  emptyLabel,
  caption,
}: AdminTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-6 font-body text-sm text-ivory-55">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[color:var(--color-line)]">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-[color:var(--color-line)] bg-ink-raised">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 font-body text-[0.65rem] uppercase tracking-[0.16em] text-ivory-55',
                  column.align === 'right' && 'text-right',
                  column.hideOnMobile && 'hidden sm:table-cell',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[color:var(--color-line)] last:border-b-0 hover:bg-ink-raised/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3.5 font-body text-sm',
                    column.align === 'right' && 'text-right',
                    column.hideOnMobile && 'hidden sm:table-cell',
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
