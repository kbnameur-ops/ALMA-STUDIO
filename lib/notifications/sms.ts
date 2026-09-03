import 'server-only';

/**
 * Envoi de SMS — abstraction fournisseur.
 *
 * L'implémentation Twilio est fournie ; un autre fournisseur s'ajoute en
 * implémentant `SmsProvider` et en l'enregistrant dans `providers`.
 * Le canal reste désactivé par défaut (`settings.sms_enabled`).
 */

export interface SmsMessage {
  to: string;
  body: string;
}

export type SmsResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: 'not_configured' | 'failed'; error?: string };

export interface SmsProvider {
  readonly name: string;
  isConfigured(): boolean;
  send(message: SmsMessage): Promise<SmsResult>;
}

const twilioProvider: SmsProvider = {
  name: 'twilio',

  isConfigured() {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM_NUMBER,
    );
  },

  async send(message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) return { ok: false, reason: 'not_configured' };

    try {
      // Appel REST direct : évite une dépendance supplémentaire pour un
      // unique endpoint.
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ To: message.to, From: from, Body: message.body }),
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        return { ok: false, reason: 'failed', error: detail.slice(0, 300) };
      }
      const payload = (await response.json()) as { sid?: string };
      return { ok: true, id: payload.sid ?? null };
    } catch (error) {
      return {
        ok: false,
        reason: 'failed',
        error: error instanceof Error ? error.message : 'erreur inconnue',
      };
    }
  },
};

/** Fournisseur inerte : conserve la même interface quand le SMS est coupé. */
const noopProvider: SmsProvider = {
  name: 'none',
  isConfigured: () => false,
  async send(message) {
    console.info(`[sms] désactivé — message non envoyé à ${message.to}`);
    return { ok: false, reason: 'not_configured' };
  },
};

const providers: Record<string, SmsProvider> = {
  twilio: twilioProvider,
  none: noopProvider,
};

export function getSmsProvider(): SmsProvider {
  const name = process.env.SMS_PROVIDER ?? 'none';
  return providers[name] ?? noopProvider;
}

export async function sendSms(message: SmsMessage): Promise<SmsResult> {
  const provider = getSmsProvider();
  if (!provider.isConfigured()) return { ok: false, reason: 'not_configured' };
  return provider.send(message);
}
