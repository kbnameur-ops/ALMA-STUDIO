import type { ReactNode } from 'react';

/** Indicateur du tableau de bord : une valeur, un libellé, un détail. */
export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--color-line)] bg-sand-50 p-5">
      <p className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-espresso-55">
        {label}
      </p>
      <p className="mt-3 font-heading text-3xl font-light tabular-nums">{value}</p>
      {detail && <p className="mt-1 font-body text-xs text-espresso-55">{detail}</p>}
    </div>
  );
}
