import 'server-only';

import { Resend } from 'resend';
import { brand } from '@/config/brand';
import type { RenderedEmail } from './templates';

/**
 * Envoi d'emails — adaptateur Resend.
 *
 * L'appelant ne connaît que `sendEmail` : remplacer Resend par un autre
 * fournisseur ne demande de modifier que ce fichier.
 */

export interface SendEmailInput extends RenderedEmail {
  to: string;
  replyTo?: string;
}

export type EmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: 'not_configured' | 'failed'; error?: string };

const fromAddress = process.env.EMAIL_FROM ?? `${brand.name} <onboarding@resend.dev>`;

let cached: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached ??= new Resend(key);
  return cached;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) {
    // En développement, on trace l'email plutôt que d'échouer silencieusement.
    console.info(`[email] non configuré — email « ${input.subject} » non envoyé à ${input.to}`);
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    if (error) {
      console.error('[email] envoi refusé', error.message);
      return { ok: false, reason: 'failed', error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erreur inconnue';
    console.error('[email] envoi impossible', message);
    return { ok: false, reason: 'failed', error: message };
  }
}

export * from './templates';
