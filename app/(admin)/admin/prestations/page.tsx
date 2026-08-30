import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';
import { ActionForm } from '@/components/admin/ActionForm';
import { ActionButton } from '@/components/admin/ActionButton';
import {
  deleteDuration,
  deleteService,
  saveDuration,
  saveService,
  toggleService,
} from '@/lib/actions/admin';
import { getAdminClient } from '@/lib/supabase/server';
import { toService } from '@/lib/repositories/mappers';
import { formatDuration, formatPrice } from '@/lib/utils/format';
import type { Service } from '@/types';

export const dynamic = 'force-dynamic';

const fieldClass =
  'w-full rounded-md border border-[color:var(--color-line-strong)] bg-ink px-4 py-3 font-body text-sm';
const labelClass = 'font-body text-[0.7rem] uppercase tracking-[0.16em] text-ivory-70';

/** Catalogue complet, prestations désactivées comprises. */
async function listAllServices(): Promise<Service[]> {
  const db = getAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from('services')
    .select('*, service_durations(*)')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[admin] prestations illisibles', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { service_durations: durations, ...service } = row;
    // `toService` filtre les durées inactives : on les réinjecte pour
    // pouvoir les rééditer depuis l'administration.
    const mapped = toService(service, durations ?? []);
    return {
      ...mapped,
      durations: (durations ?? [])
        .map((duration) => ({
          id: duration.id,
          serviceId: duration.service_id,
          minutes: duration.minutes,
          priceCents: duration.price_cents,
          isActive: duration.is_active,
          sortOrder: duration.sort_order,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.minutes - b.minutes),
    };
  });
}

function ServiceFields({ service }: { service?: Service }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {service && <input type="hidden" name="id" value={service.id} />}

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Nom</span>
        <input name="name" defaultValue={service?.name} required maxLength={120} className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Identifiant d’URL</span>
        <input
          name="slug"
          defaultValue={service?.slug}
          required
          pattern="[a-z0-9-]+"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClass}>Accroche courte</span>
        <input
          name="shortDescription"
          defaultValue={service?.shortDescription}
          required
          maxLength={300}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClass}>Description</span>
        <textarea
          name="description"
          defaultValue={service?.description}
          required
          rows={4}
          maxLength={2000}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Intensité</span>
        <select name="intensity" defaultValue={service?.intensity ?? 'moderee'} className={fieldClass}>
          <option value="douce">Douce</option>
          <option value="moderee">Modérée</option>
          <option value="dynamique">Dynamique</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Ordre d’affichage</span>
        <input
          name="sortOrder"
          type="number"
          min={0}
          max={999}
          defaultValue={service?.sortOrder ?? 100}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className={labelClass}>Profil recommandé</span>
        <input
          name="recommendedFor"
          defaultValue={service?.recommendedFor}
          maxLength={300}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>URL de l’image</span>
        <input
          name="imageUrl"
          type="url"
          defaultValue={service?.imageUrl ?? ''}
          placeholder="https://…"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Texte alternatif de l’image</span>
        <input
          name="imageAlt"
          defaultValue={service?.imageAlt}
          maxLength={200}
          className={fieldClass}
        />
      </label>

      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 font-body text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={service?.isActive ?? true}
            className="h-4 w-4 accent-[color:var(--color-terracotta)]"
          />
          Active
        </label>
        <label className="flex items-center gap-2 font-body text-sm">
          <input
            type="checkbox"
            name="isSignature"
            defaultChecked={service?.isSignature ?? false}
            className="h-4 w-4 accent-[color:var(--color-terracotta)]"
          />
          Mise en avant sur l’accueil
        </label>
        <label className="flex items-center gap-2 font-body text-sm">
          <input
            type="checkbox"
            name="homeServiceAvailable"
            defaultChecked={service?.homeServiceAvailable ?? false}
            className="h-4 w-4 accent-[color:var(--color-terracotta)]"
          />
          Disponible à domicile
        </label>
      </div>
    </div>
  );
}

export default async function AdminServicesPage() {
  const services = await listAllServices();

  return (
    <div className="space-y-12">
      <div>
        <Heading level={1} size="md">
          Prestations
        </Heading>
        <p className="mt-2 font-body text-sm text-ivory-55">
          Les tarifs affichés sur le site proviennent d’ici. Aucun prix n’est écrit dans le code.
        </p>
      </div>

      <section className="space-y-8">
        {services.map((service) => (
          <details
            key={service.id}
            className="rounded-lg border border-[color:var(--color-line)] p-5 sm:p-6"
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-3">
              <span className="font-heading text-xl font-light">{service.name}</span>
              {!service.isActive && <Badge tone="outline">Désactivée</Badge>}
              {service.isSignature && <Badge tone="accent">Signature</Badge>}
              <span className="ml-auto font-body text-xs text-ivory-55">
                {service.durations.map((duration) => formatDuration(duration.minutes)).join(' · ')}
              </span>
            </summary>

            <div className="mt-6 space-y-8">
              <ActionForm action={saveService} submitLabel="Enregistrer la prestation">
                <ServiceFields service={service} />
              </ActionForm>

              <div>
                <h3 className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                  Durées &amp; tarifs
                </h3>

                <ul className="mt-4 space-y-3">
                  {service.durations.map((duration) => (
                    <li
                      key={duration.id}
                      className="flex flex-wrap items-center gap-3 rounded-md border border-[color:var(--color-line)] p-3"
                    >
                      <span className="font-body text-sm">{formatDuration(duration.minutes)}</span>
                      <span className="font-body text-sm text-ivory-55">
                        {formatPrice(duration.priceCents)}
                      </span>
                      {!duration.isActive && <Badge tone="outline">Inactive</Badge>}
                      <span className="ml-auto">
                        <ActionButton
                          action={async () => {
                            'use server';
                            return deleteDuration(duration.id);
                          }}
                          label="Supprimer"
                          variant="ghost"
                          confirmMessage="Supprimer ce tarif ?"
                          successMessage="Tarif supprimé."
                        />
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-md border border-dashed border-[color:var(--color-line-strong)] p-4">
                  <ActionForm action={saveDuration} submitLabel="Ajouter ce tarif" resetOnSuccess>
                    <input type="hidden" name="serviceId" value={service.id} />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="flex flex-col gap-1.5">
                        <span className={labelClass}>Durée (min)</span>
                        <input
                          name="minutes"
                          type="number"
                          min={15}
                          max={300}
                          step={5}
                          required
                          className={fieldClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={labelClass}>Prix (€)</span>
                        <input
                          name="priceEuros"
                          type="number"
                          min={0}
                          step={1}
                          required
                          className={fieldClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={labelClass}>Ordre</span>
                        <input
                          name="sortOrder"
                          type="number"
                          min={0}
                          max={999}
                          defaultValue={100}
                          className={fieldClass}
                        />
                      </label>
                    </div>
                    <label className="flex items-center gap-2 font-body text-sm">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked
                        className="h-4 w-4 accent-[color:var(--color-terracotta)]"
                      />
                      Proposée à la réservation
                    </label>
                  </ActionForm>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[color:var(--color-line)] pt-5">
                <ActionButton
                  action={async () => {
                    'use server';
                    return toggleService(service.id, !service.isActive);
                  }}
                  label={service.isActive ? 'Désactiver' : 'Activer'}
                  successMessage="Prestation mise à jour."
                />
                <ActionButton
                  action={async () => {
                    'use server';
                    return deleteService(service.id);
                  }}
                  label="Supprimer"
                  variant="danger"
                  confirmMessage="Supprimer définitivement cette prestation ?"
                />
              </div>
            </div>
          </details>
        ))}

        {services.length === 0 && (
          <p className="rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-6 font-body text-sm text-ivory-55">
            Aucune prestation en base. Exécutez `supabase/seed.sql` ou créez-en une ci-dessous.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-[color:var(--color-line)] p-5 sm:p-6">
        <Heading size="sm" className="mb-6">
          Nouvelle prestation
        </Heading>
        <ActionForm action={saveService} submitLabel="Créer la prestation" resetOnSuccess>
          <ServiceFields />
        </ActionForm>
      </section>
    </div>
  );
}
