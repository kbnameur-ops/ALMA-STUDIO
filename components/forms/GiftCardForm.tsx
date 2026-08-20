'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Textarea } from '@/components/forms/Field';
import { GiftCardPreview } from '@/components/marketing/GiftCardPreview';
import { StripePaymentForm } from '@/components/booking/StripePaymentForm';
import { GIFT_CARD_MAX_CENTS, GIFT_CARD_MIN_CENTS } from '@/lib/validation/giftcard';
import { formatDuration, formatPrice } from '@/lib/utils/format';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils/cn';
import type { Service } from '@/types';

interface GiftCardFormProps {
  services: Service[];
  /** Montants libres proposés en raccourci, en centimes. */
  suggestedAmounts?: number[];
}

type Choice = { kind: 'service'; durationId: string } | { kind: 'amount'; cents: number | null };

/**
 * Parcours d'achat d'une carte cadeau.
 *
 * La carte n'est émise qu'après confirmation du paiement par le webhook
 * Stripe : ce formulaire ne fait que préparer l'intention de paiement.
 */
export function GiftCardForm({
  services,
  suggestedAmounts = [5000, 9000, 12500, 15000],
}: GiftCardFormProps) {
  const [choice, setChoice] = useState<Choice>({ kind: 'amount', cents: null });
  const [customAmount, setCustomAmount] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [acceptsTerms, setAcceptsTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [session, setSession] = useState<{ clientSecret: string; amountCents: number } | null>(null);

  /** Options mises en avant : durées de 60, 90 et 120 minutes. */
  const featured = useMemo(
    () =>
      services.flatMap((service) =>
        service.durations
          .filter((duration) => [60, 90, 120].includes(duration.minutes))
          .map((duration) => ({ service, duration })),
      ),
    [services],
  );

  const selectedDuration =
    choice.kind === 'service'
      ? featured.find(({ duration }) => duration.id === choice.durationId)
      : undefined;

  const amountCents =
    choice.kind === 'service'
      ? (selectedDuration?.duration.priceCents ?? null)
      : choice.cents;

  const serviceLabel = selectedDuration
    ? `${selectedDuration.service.name} — ${formatDuration(selectedDuration.duration.minutes)}`
    : null;

  const submit = async () => {
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: choice.kind,
          serviceDurationId: choice.kind === 'service' ? choice.durationId : null,
          amountCents: choice.kind === 'amount' ? choice.cents : null,
          purchaserName,
          purchaserEmail,
          recipientName,
          recipientEmail: recipientEmail || null,
          message: message || null,
          acceptsTerms,
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const body = payload as { error?: string; fields?: Record<string, string> };
        if (body.fields) setErrors(body.fields);
        setFormError(body.error ?? 'Achat impossible pour le moment.');
        return;
      }

      setSession(payload as { clientSecret: string; amountCents: number });
      trackEvent({ name: analyticsEvents.giftCardStarted });
    } catch {
      setFormError('Achat impossible pour le moment. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const ready =
    amountCents !== null &&
    amountCents > 0 &&
    purchaserName.trim().length > 0 &&
    purchaserEmail.trim().length > 0 &&
    recipientName.trim().length > 0 &&
    acceptsTerms;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <div className="space-y-8">
        {!session && (
          <>
            <fieldset>
              <legend className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                Que souhaitez-vous offrir ?
              </legend>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {featured.map(({ service, duration }) => {
                  const selected =
                    choice.kind === 'service' && choice.durationId === duration.id;
                  return (
                    <label
                      key={duration.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-all duration-300',
                        selected
                          ? 'border-terracotta bg-terracotta/6'
                          : 'border-[color:var(--color-line)] hover:border-espresso/30',
                      )}
                    >
                      <input
                        type="radio"
                        name="carte"
                        checked={selected}
                        onChange={() => setChoice({ kind: 'service', durationId: duration.id })}
                        className="sr-only"
                      />
                      <span>
                        <span className="block font-body text-sm">{service.name}</span>
                        <span className="block font-body text-xs text-espresso-55">
                          {formatDuration(duration.minutes)}
                        </span>
                      </span>
                      <span className="font-body text-sm tabular-nums">
                        {formatPrice(duration.priceCents)}
                      </span>
                    </label>
                  );
                })}
              </div>

              <p className="mt-6 font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                Ou un montant libre
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedAmounts.map((cents) => {
                  const selected = choice.kind === 'amount' && choice.cents === cents;
                  return (
                    <button
                      key={cents}
                      type="button"
                      onClick={() => {
                        setChoice({ kind: 'amount', cents });
                        setCustomAmount('');
                      }}
                      className={cn(
                        'rounded-full border px-5 py-2 font-body text-sm tabular-nums transition-all duration-300',
                        selected
                          ? 'border-terracotta bg-terracotta text-ivory'
                          : 'border-[color:var(--color-line-strong)] hover:border-espresso',
                      )}
                    >
                      {formatPrice(cents)}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 max-w-xs">
                <Input
                  label="Autre montant (€)"
                  type="number"
                  inputMode="numeric"
                  min={GIFT_CARD_MIN_CENTS / 100}
                  max={GIFT_CARD_MAX_CENTS / 100}
                  value={customAmount}
                  onChange={(event) => {
                    setCustomAmount(event.target.value);
                    const euros = Number.parseInt(event.target.value, 10);
                    setChoice({
                      kind: 'amount',
                      cents: Number.isFinite(euros) ? euros * 100 : null,
                    });
                  }}
                  error={errors.amountCents}
                  hint={`Entre ${GIFT_CARD_MIN_CENTS / 100} € et ${GIFT_CARD_MAX_CENTS / 100} €`}
                />
              </div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-5 font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                Le bénéficiaire
              </legend>
              <Input
                label="Nom du bénéficiaire"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                error={errors.recipientName}
                required
              />
              <Input
                label="Email du bénéficiaire"
                type="email"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                error={errors.recipientEmail}
                hint="Laissez vide pour recevoir la carte vous-même."
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Message personnalisé"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={600}
                  rows={3}
                  error={errors.message}
                />
              </div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-5 font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                Vous
              </legend>
              <Input
                label="Votre nom"
                value={purchaserName}
                onChange={(event) => setPurchaserName(event.target.value)}
                error={errors.purchaserName}
                autoComplete="name"
                required
              />
              <Input
                label="Votre email"
                type="email"
                value={purchaserEmail}
                onChange={(event) => setPurchaserEmail(event.target.value)}
                error={errors.purchaserEmail}
                autoComplete="email"
                required
              />
            </fieldset>

            <Checkbox
              checked={acceptsTerms}
              onChange={(event) => setAcceptsTerms(event.target.checked)}
              error={errors.acceptsTerms}
              label="J’accepte les conditions générales de vente. La carte est valable 12 mois, non remboursable."
            />

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-terracotta/40 bg-terracotta/6 p-4 font-body text-sm text-terracotta"
              >
                {formError}
              </p>
            )}

            <Button
              type="button"
              size="lg"
              onClick={() => void submit()}
              disabled={!ready || submitting}
            >
              {submitting
                ? 'Préparation…'
                : amountCents
                  ? `Offrir — ${formatPrice(amountCents)}`
                  : 'Offrir cette carte'}
            </Button>
          </>
        )}

        {session && (
          <StripePaymentForm
            clientSecret={session.clientSecret}
            amountCents={session.amountCents}
            returnUrl={
              typeof window === 'undefined'
                ? ''
                : `${window.location.origin}/carte-cadeau/merci`
            }
          />
        )}
      </div>

      <div>
        <div className="sticky top-28">
          <GiftCardPreview
            amountCents={amountCents}
            serviceLabel={serviceLabel}
            recipientName={recipientName}
            purchaserName={purchaserName}
            message={message}
          />
          <p className="mt-4 px-1 font-body text-xs leading-relaxed text-espresso-55">
            Le bénéficiaire reçoit sa carte par email dès la validation du paiement, avec un code à
            saisir au moment de réserver.
          </p>
        </div>
      </div>
    </div>
  );
}
