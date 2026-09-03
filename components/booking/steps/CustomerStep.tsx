'use client';

import Link from 'next/link';
import { Checkbox, Input, Textarea } from '@/components/forms/Field';
import type { CustomerDraft } from '../state';

interface CustomerStepProps {
  customer: CustomerDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CustomerDraft>) => void;
}

/**
 * Étape 5 — coordonnées du client.
 *
 * Aucune information médicale n'est demandée. Le consentement marketing est
 * distinct de l'acceptation des conditions, et reste facultatif.
 */
export function CustomerStep({ customer, errors, onChange }: CustomerStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Prénom"
          value={customer.firstName}
          onChange={(event) => onChange({ firstName: event.target.value })}
          error={errors['customer.firstName']}
          autoComplete="given-name"
          required
        />
        <Input
          label="Nom"
          value={customer.lastName}
          onChange={(event) => onChange({ lastName: event.target.value })}
          error={errors['customer.lastName']}
          autoComplete="family-name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={customer.email}
          onChange={(event) => onChange({ email: event.target.value })}
          error={errors['customer.email']}
          hint="La confirmation et le lien de gestion y seront envoyés."
          autoComplete="email"
          required
        />
        <Input
          label="Téléphone"
          type="tel"
          value={customer.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          error={errors['customer.phone']}
          autoComplete="tel"
          required
        />
      </div>

      <Textarea
        label="Message (facultatif)"
        value={customer.note}
        onChange={(event) => onChange({ note: event.target.value })}
        maxLength={1000}
        hint="Une préférence, une précision d’accès, une occasion particulière."
        rows={3}
      />

      <div className="space-y-3 rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-5">
        <Checkbox
          checked={customer.acceptsTerms}
          onChange={(event) => onChange({ acceptsTerms: event.target.checked })}
          error={errors['customer.acceptsTerms']}
          required
          label="J’accepte les conditions de réservation."
          hint={
            <Link
              href="/cgv"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-ivory"
            >
              Lire les conditions générales de vente
            </Link>
          }
        />
        <Checkbox
          checked={customer.marketingConsent}
          onChange={(event) => onChange({ marketingConsent: event.target.checked })}
          label="Je souhaite recevoir occasionnellement des nouvelles du studio. (facultatif)"
        />
      </div>

      <p className="font-body text-xs leading-relaxed text-ivory-55">
        Vos données servent uniquement à gérer votre réservation. Elles ne sont ni revendues ni
        cédées. Voir la{' '}
        <Link href="/politique-confidentialite" target="_blank" className="underline underline-offset-2">
          politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
