import { brand } from '@/config/brand';
import { site } from '@/config/site';

/**
 * Gabarit HTML commun aux emails.
 *
 * Écrit en tableaux et styles en ligne : c'est la seule mise en forme que
 * les clients email traitent de façon fiable. La charte Alhambra est reprise
 * depuis `config/brand.ts`, donc un changement de palette se propage aux
 * emails sans retouche manuelle.
 */

const { colors } = brand;

export interface EmailButton {
  label: string;
  url: string;
}

export interface EmailLayoutInput {
  /** Titre affiché en haut du corps du message. */
  heading: string;
  /** Paragraphes d'introduction. */
  intro: string[];
  /** Tableau récapitulatif clé / valeur. */
  details?: Array<{ label: string; value: string }>;
  primaryButton?: EmailButton;
  secondaryButton?: EmailButton;
  /** Paragraphes de fin (politique d'annulation, mentions). */
  outro?: string[];
  /** Encart mis en avant (code carte cadeau, message personnel). */
  highlight?: { label: string; value: string; note?: string };
}

/** Échappe le HTML : tout contenu variable passe par cette fonction. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function button({ label, url }: EmailButton, variant: 'primary' | 'secondary'): string {
  const background = variant === 'primary' ? colors.terracotta : 'transparent';
  const color = variant === 'primary' ? colors.ivory : colors.ink;
  const border = variant === 'primary' ? colors.terracotta : 'rgba(48,42,37,0.25)';
  return `<a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 26px;margin:0 8px 8px 0;background:${background};color:${color};border:1px solid ${border};border-radius:999px;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.04em;text-decoration:none;">${escapeHtml(label)}</a>`;
}

export function renderEmail(input: EmailLayoutInput): string {
  const details = input.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;border-top:1px solid rgba(48,42,37,0.12);">
        ${input.details
          .map(
            (row) => `<tr>
              <td style="padding:11px 0;border-bottom:1px solid rgba(48,42,37,0.12);font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(48,42,37,0.55);">${escapeHtml(row.label)}</td>
              <td align="right" style="padding:11px 0;border-bottom:1px solid rgba(48,42,37,0.12);font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${colors.ink};">${escapeHtml(row.value)}</td>
            </tr>`,
          )
          .join('')}
      </table>`
    : '';

  const highlight = input.highlight
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;background:${colors.bone};border-radius:10px;">
        <tr><td style="padding:24px;text-align:center;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${colors.champagne};">${escapeHtml(input.highlight.label)}</p>
          <p style="margin:10px 0 0;font-family:Georgia,serif;font-size:28px;letter-spacing:0.08em;color:${colors.ink};">${escapeHtml(input.highlight.value)}</p>
          ${input.highlight.note ? `<p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:rgba(48,42,37,0.6);">${escapeHtml(input.highlight.note)}</p>` : ''}
        </td></tr>
      </table>`
    : '';

  const buttons =
    input.primaryButton || input.secondaryButton
      ? `<div style="margin:28px 0 8px;">
          ${input.primaryButton ? button(input.primaryButton, 'primary') : ''}
          ${input.secondaryButton ? button(input.secondaryButton, 'secondary') : ''}
        </div>`
      : '';

  const paragraphs = (items: string[] | undefined, muted = false): string =>
    (items ?? [])
      .map(
        (text) =>
          `<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:${muted ? 'rgba(48,42,37,0.6)' : 'rgba(48,42,37,0.8)'};">${escapeHtml(text)}</p>`,
      )
      .join('');

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(input.heading)}</title></head>
<body style="margin:0;padding:0;background:${colors.ivory};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.ivory};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:36px 36px 0;text-align:center;">
          <p style="margin:0;font-family:Georgia,serif;font-size:24px;letter-spacing:0.24em;color:${colors.ink};">${brand.nameParts.primary}</p>
          <p style="margin:6px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.5em;color:${colors.terracotta};">${brand.nameParts.secondary}</p>
        </td></tr>
        <tr><td style="padding:32px 36px 40px;">
          <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:27px;font-weight:normal;line-height:1.2;color:${colors.ink};">${escapeHtml(input.heading)}</h1>
          ${paragraphs(input.intro)}
          ${highlight}
          ${details}
          ${buttons}
          ${paragraphs(input.outro, true)}
        </td></tr>
        <tr><td style="padding:24px 36px 32px;background:${colors.bone};text-align:center;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:rgba(48,42,37,0.65);">${escapeHtml(brand.signature)} · ${escapeHtml(site.businessAddress.city)}</p>
          <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:rgba(48,42,37,0.45);">${escapeHtml(site.contactEmail)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Version texte, indispensable pour la délivrabilité et l'accessibilité. */
export function renderPlainText(input: EmailLayoutInput): string {
  const lines = [brand.name, brand.signature, '', input.heading, '', ...input.intro];
  if (input.highlight) {
    lines.push('', `${input.highlight.label} : ${input.highlight.value}`);
    if (input.highlight.note) lines.push(input.highlight.note);
  }
  if (input.details?.length) {
    lines.push('');
    for (const row of input.details) lines.push(`${row.label} : ${row.value}`);
  }
  if (input.primaryButton) lines.push('', `${input.primaryButton.label} : ${input.primaryButton.url}`);
  if (input.secondaryButton) {
    lines.push(`${input.secondaryButton.label} : ${input.secondaryButton.url}`);
  }
  if (input.outro?.length) lines.push('', ...input.outro);
  return lines.join('\n');
}
