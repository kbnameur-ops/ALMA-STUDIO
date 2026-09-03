'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { site } from '@/config/site';
import { useToast } from '@/components/ui/Toast';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { BookingStepper } from './BookingStepper';
import { BookingSummary } from './BookingSummary';
import { PromoCodeField } from './PromoCodeField';
import { StripePaymentForm } from './StripePaymentForm';
import { ServiceStep } from './steps/ServiceStep';
import { DurationStep } from './steps/DurationStep';
import { LocationStep } from './steps/LocationStep';
import { SlotStep } from './steps/SlotStep';
import { CustomerStep } from './steps/CustomerStep';
import {
  BOOKING_STEPS,
  bookingReducer,
  canLeaveStep,
  initialBookingState,
  type StepId,
} from './state';
import type { Service } from '@/types';

interface BookingWizardProps {
  services: Service[];
  /** Présélections issues de l'URL (`?service=…&duree=…`). */
  preselectedSlug?: string | undefined;
  preselectedMinutes?: number | undefined;
  /** Faux quand la réservation en ligne est momentanément coupée. */
  bookingEnabled: boolean;
}

interface PaymentSession {
  clientSecret: string | null;
  reference: string;
  manageToken: string;
  totalCents: number;
  requiresPayment: boolean;
  mode: 'payment' | 'request';
}

const stepHeadings: Record<StepId, { title: string; hint: string }> = {
  1: { title: 'Choisissez votre séance', hint: 'Une prestation à la fois.' },
  2: { title: 'Choisissez la durée', hint: 'Le tarif s’ajuste automatiquement.' },
  3: { title: 'Où souhaitez-vous être reçu ?', hint: 'Le studio reste la formule principale.' },
  4: { title: 'Choisissez votre créneau', hint: 'Seuls les créneaux réellement libres sont affichés.' },
  5: { title: 'Vos informations', hint: 'Pour la confirmation et l’accès au studio.' },
  6: site.onlinePaymentEnabled
    ? { title: 'Récapitulatif & paiement', hint: 'Dernière étape.' }
    : {
        title: 'Récapitulatif & demande',
        hint: 'Aucun paiement en ligne : nous confirmons votre créneau.',
      },
};

/**
 * Tunnel de réservation en sept étapes (la septième étant la page de
 * confirmation).
 *
 * Le composant ne décide de rien qui engage : disponibilités, prix,
 * validité des codes et création de la réservation sont traités côté
 * serveur. Il orchestre l'expérience et transmet la saisie.
 */
export function BookingWizard({
  services,
  preselectedSlug,
  preselectedMinutes,
  bookingEnabled,
}: BookingWizardProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const router = useRouter();

  // Présélection depuis une page prestation : on ouvre directement l'étape
  // utile plutôt que de refaire choisir ce qui vient d'être choisi.
  useEffect(() => {
    if (!preselectedSlug) return;
    const service = services.find((item) => item.slug === preselectedSlug);
    if (!service) return;

    dispatch({ type: 'selectService', service });
    const duration = preselectedMinutes
      ? service.durations.find((item) => item.minutes === preselectedMinutes)
      : undefined;
    if (duration) {
      dispatch({ type: 'selectDuration', duration });
      dispatch({ type: 'goTo', step: 3 });
    } else {
      dispatch({ type: 'goTo', step: 2 });
    }
  }, [preselectedSlug, preselectedMinutes, services]);

  useEffect(() => {
    trackEvent({ name: analyticsEvents.bookingStarted });
  }, []);

  const maxReachable = useMemo<StepId>(() => {
    let reachable: StepId = 1;
    for (const step of BOOKING_STEPS) {
      if (canLeaveStep(state, step.id)) reachable = Math.min(step.id + 1, 6) as StepId;
      else break;
    }
    return reachable;
  }, [state]);

  const canContinue = canLeaveStep(state, state.step);

  const goNext = useCallback(() => {
    if (!canContinue) return;
    trackEvent({
      name: analyticsEvents.bookingStepCompleted,
      props: { etape: state.step },
    });
    dispatch({ type: 'next' });
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [canContinue, state.step, reduceMotion]);

  const goBack = useCallback(() => {
    dispatch({ type: 'back' });
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [reduceMotion]);

  /**
   * Crée la réservation côté serveur.
   *
   * Avec paiement en ligne, ouvre ensuite Stripe. Sans, la demande est
   * partie au studio et l'on rejoint directement la page de suivi.
   */
  const startPayment = useCallback(async () => {
    if (!state.service || !state.duration || !state.slot) return;

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: state.service.id,
          serviceDurationId: state.duration.id,
          locationKind: state.locationKind,
          address: state.address,
          startsAt: state.slot.startsAt,
          promotionCode: state.discount?.kind === 'promotion' ? state.discount.code : null,
          giftCardCode: state.discount?.kind === 'gift_card' ? state.discount.code : null,
          customer: {
            firstName: state.customer.firstName,
            lastName: state.customer.lastName,
            email: state.customer.email,
            phone: state.customer.phone,
            note: state.customer.note || null,
            acceptsTerms: state.customer.acceptsTerms,
            marketingConsent: state.customer.marketingConsent,
          },
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const body = payload as { error?: string; code?: string; fields?: Record<string, string> };
        if (body.fields) setFieldErrors(body.fields);
        setFormError(body.error ?? 'Réservation impossible pour le moment.');

        // Créneau pris entre-temps : on renvoie au choix d'horaire.
        if (body.code === 'SLOT_TAKEN') {
          dispatch({ type: 'selectSlot', slot: null });
          dispatch({ type: 'goTo', step: 4 });
          toast.push('Ce créneau vient d’être réservé. Choisissez-en un autre.', 'error');
        }
        return;
      }

      const result = payload as PaymentSession;
      setSession(result);
      if (result.requiresPayment) trackEvent({ name: analyticsEvents.bookingPaymentStarted });

      // Rien à payer ici : demande envoyée au studio, ou séance
      // intégralement couverte par une carte cadeau.
      if (!result.requiresPayment) {
        router.push(
          `/reservation/confirmation?ref=${result.reference}&token=${result.manageToken}`,
        );
      }
    } catch {
      setFormError('Réservation impossible pour le moment. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  }, [state, router, toast]);

  if (!bookingEnabled) {
    return (
      <div className="rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-8">
        <Heading size="sm">La réservation en ligne est momentanément fermée.</Heading>
        <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
          Le planning rouvre très prochainement. Écrivez-nous pour être prévenu de la réouverture des
          créneaux.
        </p>
      </div>
    );
  }

  const heading = stepHeadings[state.step];
  const returnUrl =
    typeof window === 'undefined' || !session
      ? ''
      : `${window.location.origin}/reservation/confirmation?ref=${session.reference}&token=${session.manageToken}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <div>
        <BookingStepper
          current={state.step}
          maxReachable={maxReachable}
          onSelect={(step) => dispatch({ type: 'goTo', step })}
        />

        <div className="mt-10">
          <Heading size="md">{heading.title}</Heading>
          <p className="mt-2 font-body text-sm text-ivory-55">{heading.hint}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            {state.step === 1 && (
              <ServiceStep
                services={services}
                selectedId={state.service?.id ?? null}
                onSelect={(service) => dispatch({ type: 'selectService', service })}
              />
            )}

            {state.step === 2 && state.service && (
              <DurationStep
                service={state.service}
                selectedId={state.duration?.id ?? null}
                onSelect={(duration) => dispatch({ type: 'selectDuration', duration })}
              />
            )}

            {state.step === 3 && state.service && (
              <LocationStep
                service={state.service}
                locationKind={state.locationKind}
                address={state.address}
                zoneName={state.zoneName}
                travelFeeCents={state.travelFeeCents}
                onSelectKind={(kind) => dispatch({ type: 'selectLocation', kind })}
                onAddressConfirmed={(address, travelFeeCents, zoneName) =>
                  dispatch({ type: 'setAddress', address, travelFeeCents, zoneName })
                }
              />
            )}

            {state.step === 4 && state.duration && (
              <SlotStep
                serviceDurationId={state.duration.id}
                locationKind={state.locationKind}
                postalCode={state.address?.postalCode ?? null}
                selected={state.slot}
                onSelect={(slot) => dispatch({ type: 'selectSlot', slot })}
              />
            )}

            {state.step === 5 && (
              <CustomerStep
                customer={state.customer}
                errors={fieldErrors}
                onChange={(patch) => dispatch({ type: 'setCustomer', patch })}
              />
            )}

            {state.step === 6 && state.service && state.duration && (
              <div className="space-y-6">
                <div className="lg:hidden">
                  <BookingSummary state={state} compact />
                </div>

                {!session && (
                  <PromoCodeField
                    serviceId={state.service.id}
                    serviceDurationId={state.duration.id}
                    applied={state.discount}
                    onApply={(discount) => dispatch({ type: 'setDiscount', discount })}
                  />
                )}

                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-terracotta/40 bg-terracotta/6 p-4 font-body text-sm text-terracotta"
                  >
                    {formError}
                  </p>
                )}

                {session?.clientSecret ? (
                  <StripePaymentForm
                    clientSecret={session.clientSecret}
                    amountCents={session.totalCents}
                    returnUrl={returnUrl}
                  />
                ) : (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      fullWidth
                      onClick={() => void startPayment()}
                      disabled={submitting}
                    >
                      {submitting
                        ? 'Envoi…'
                        : site.onlinePaymentEnabled
                          ? 'Réserver et payer'
                          : 'Envoyer ma demande'}
                    </Button>
                    <p className="text-center font-body text-xs leading-relaxed text-ivory-55">
                      {site.onlinePaymentEnabled
                        ? 'Le créneau vous est retenu le temps de finaliser le paiement.'
                        : `Aucun paiement en ligne. Le créneau vous est retenu ${site.requestHoldHours} heures, le temps que nous confirmions par email ou WhatsApp. Le règlement se fait sur place.`}
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {state.step < 6 && (
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-[color:var(--color-line)] pt-6">
            <Button type="button" variant="ghost" onClick={goBack} disabled={state.step === 1}>
              Retour
            </Button>
            <Button type="button" onClick={goNext} disabled={!canContinue}>
              Continuer
            </Button>
          </div>
        )}

        {state.step === 6 && !session && (
          <div className="mt-8 border-t border-[color:var(--color-line)] pt-6">
            <Button type="button" variant="ghost" onClick={goBack}>
              Retour
            </Button>
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-28">
          {state.service ? (
            <BookingSummary state={state} />
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--color-line-strong)] p-6">
              <p className="font-body text-sm text-ivory-55">
                Votre récapitulatif apparaîtra ici au fil de vos choix.
              </p>
            </div>
          )}

          {state.duration && (
            <p className="mt-4 px-1 font-body text-xs leading-relaxed text-ivory-55">
              {site.onlinePaymentEnabled
                ? 'Montant indicatif. Le total facturé est recalculé par nos serveurs au moment du paiement, à partir des tarifs en vigueur.'
                : 'Montant calculé par nos serveurs à partir des tarifs en vigueur, et confirmé avec votre créneau. Règlement sur place.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
