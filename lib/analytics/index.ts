/**
 * Mesure d'audience — abstraction fournisseur.
 *
 * Le reste du code appelle uniquement `trackEvent` / `trackPageview` ;
 * le fournisseur réel (Plausible, Google Analytics, ou aucun) est décidé
 * par les variables d'environnement. Aucun événement n'est envoyé tant
 * que le consentement n'a pas été donné (voir `CookieBanner`).
 */

export type AnalyticsProvider = 'plausible' | 'ga' | 'none';

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
}

export const analyticsProvider: AnalyticsProvider =
  (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsProvider | undefined) ?? 'none';

export const analyticsDomain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ?? '';
export const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID ?? '';

let consentGranted = false;

export function setAnalyticsConsent(granted: boolean): void {
  consentGranted = granted;
}

export function hasAnalyticsConsent(): boolean {
  return consentGranted;
}

interface PlausibleWindow {
  plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
  gtag?: (command: string, ...args: unknown[]) => void;
}

function client(): PlausibleWindow | null {
  return typeof window === 'undefined' ? null : (window as unknown as PlausibleWindow);
}

export function trackEvent(event: AnalyticsEvent): void {
  if (!consentGranted || analyticsProvider === 'none') return;
  const target = client();
  if (!target) return;

  if (analyticsProvider === 'plausible') {
    target.plausible?.(event.name, event.props ? { props: event.props } : undefined);
    return;
  }
  target.gtag?.('event', event.name, event.props ?? {});
}

export function trackPageview(path: string): void {
  if (!consentGranted || analyticsProvider === 'none') return;
  const target = client();
  if (analyticsProvider === 'ga') {
    target?.gtag?.('event', 'page_view', { page_path: path });
  }
  // Plausible suit les pages vues automatiquement via son script.
}

/** Événements du tunnel, nommés une seule fois pour rester cohérents. */
export const analyticsEvents = {
  bookingStarted: 'reservation_demarree',
  bookingStepCompleted: 'reservation_etape',
  bookingPaymentStarted: 'reservation_paiement',
  bookingConfirmed: 'reservation_confirmee',
  giftCardStarted: 'carte_cadeau_demarree',
} as const;
