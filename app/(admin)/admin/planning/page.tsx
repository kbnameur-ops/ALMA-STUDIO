import { Heading } from '@/components/ui/Heading';
import { ActionForm } from '@/components/admin/ActionForm';
import { ActionButton } from '@/components/admin/ActionButton';
import { AdminTable } from '@/components/admin/AdminTable';
import { addBlockedSlot, deleteBlockedSlot, saveBusinessHours } from '@/lib/actions/admin';
import { getBusinessHours } from '@/lib/repositories/schedule';
import { getAdminClient } from '@/lib/supabase/server';
import { site } from '@/config/site';
import { formatDateTime } from '@/lib/utils/format';
import type { BlockedSlot } from '@/types';

export const dynamic = 'force-dynamic';

const weekdayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/** Congés, pauses et fermetures ponctuelles à venir. */
async function listBlockedSlots(): Promise<BlockedSlot[]> {
  const db = getAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from('blocked_slots')
    .select('*')
    .gte('ends_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('[admin] indisponibilités illisibles', error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason,
  }));
}

export default async function AdminPlanningPage() {
  const [hours, blocked] = await Promise.all([getBusinessHours(), listBlockedSlots()]);

  return (
    <div className="space-y-12">
      <div>
        <Heading level={1} size="md">
          Planning
        </Heading>
        <p className="mt-2 font-body text-sm text-espresso-55">
          Horaires réguliers et fermetures ponctuelles. Les créneaux proposés en ligne en découlent
          directement. Fuseau : {site.timezone}.
        </p>
      </div>

      <section>
        <Heading size="sm" className="mb-5">
          Horaires réguliers
        </Heading>

        <div className="rounded-lg border border-[color:var(--color-line)] p-5 sm:p-6">
          <ActionForm action={saveBusinessHours} submitLabel="Enregistrer les horaires">
            <div className="space-y-3">
              {weekdayNames.map((name, weekday) => {
                const entry = hours.find((item) => item.weekday === weekday);
                return (
                  <div
                    key={weekday}
                    className="grid items-center gap-3 sm:grid-cols-[8rem_auto_1fr_1fr]"
                  >
                    <span className="font-body text-sm">{name}</span>

                    <label className="flex items-center gap-2 font-body text-xs text-espresso-55">
                      <input
                        type="checkbox"
                        name={`isOpen-${weekday}`}
                        defaultChecked={entry?.isOpen ?? false}
                        className="h-4 w-4 accent-[color:var(--color-terracotta)]"
                      />
                      Ouvert
                    </label>

                    <label className="flex items-center gap-2 font-body text-xs text-espresso-55">
                      Ouverture
                      <input
                        type="time"
                        name={`opensAt-${weekday}`}
                        defaultValue={entry?.opensAt ?? '10:00'}
                        className="rounded-md border border-[color:var(--color-line-strong)] bg-ivory px-3 py-2 font-body text-sm"
                      />
                    </label>

                    <label className="flex items-center gap-2 font-body text-xs text-espresso-55">
                      Fermeture
                      <input
                        type="time"
                        name={`closesAt-${weekday}`}
                        defaultValue={entry?.closesAt ?? '20:00'}
                        className="rounded-md border border-[color:var(--color-line-strong)] bg-ivory px-3 py-2 font-body text-sm"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </ActionForm>
        </div>
      </section>

      <section>
        <Heading size="sm" className="mb-5">
          Congés &amp; indisponibilités
        </Heading>

        <div className="mb-8 rounded-lg border border-[color:var(--color-line)] p-5 sm:p-6">
          <ActionForm action={addBlockedSlot} submitLabel="Bloquer cette période" resetOnSuccess>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[0.7rem] uppercase tracking-[0.16em] text-espresso-70">
                  Début
                </span>
                <input
                  type="datetime-local"
                  name="startsAt"
                  required
                  className="rounded-md border border-[color:var(--color-line-strong)] bg-ivory px-4 py-3 font-body text-sm"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[0.7rem] uppercase tracking-[0.16em] text-espresso-70">
                  Fin
                </span>
                <input
                  type="datetime-local"
                  name="endsAt"
                  required
                  className="rounded-md border border-[color:var(--color-line-strong)] bg-ivory px-4 py-3 font-body text-sm"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[0.7rem] uppercase tracking-[0.16em] text-espresso-70">
                  Motif (interne)
                </span>
                <input
                  type="text"
                  name="reason"
                  maxLength={200}
                  placeholder="Congés, pause, rendez-vous"
                  className="rounded-md border border-[color:var(--color-line-strong)] bg-ivory px-4 py-3 font-body text-sm"
                />
              </label>
            </div>
          </ActionForm>
        </div>

        <AdminTable
          columns={[
            { key: 'start', header: 'Début', cell: (row: BlockedSlot) => formatDateTime(row.startsAt) },
            { key: 'end', header: 'Fin', cell: (row: BlockedSlot) => formatDateTime(row.endsAt) },
            {
              key: 'reason',
              header: 'Motif',
              hideOnMobile: true,
              cell: (row: BlockedSlot) => row.reason ?? '—',
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              cell: (row: BlockedSlot) => (
                <ActionButton
                  action={async () => {
                    'use server';
                    return deleteBlockedSlot(row.id);
                  }}
                  label="Supprimer"
                  variant="ghost"
                  confirmMessage="Supprimer cette indisponibilité ?"
                  successMessage="Indisponibilité supprimée."
                />
              ),
            },
          ]}
          rows={blocked}
          rowKey={(row) => row.id}
          emptyLabel="Aucune indisponibilité à venir."
          caption="Indisponibilités à venir"
        />
      </section>
    </div>
  );
}
