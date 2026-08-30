import { site } from '@/config/site';
import { formatDateTime } from '@/lib/utils/format';

interface RequestSentNoticeProps {
  reference: string;
  serviceName: string;
  startsAt: string;
  customerEmail: string;
}

/**
 * Accusé de réception d'une demande de réservation.
 *
 * Le contraire du `PendingPaymentNotice` : rien n'est en cours de
 * validation automatique, aucune page ne s'actualisera d'elle-même. C'est
 * une personne qui répond, et l'écran doit le dire — sans quoi le client
 * attend un email qui ne viendra qu'après un geste humain.
 *
 * Le raccourci WhatsApp est pré-rempli avec la référence : le studio
 * retrouve la demande sans avoir à la faire épeler.
 */
export function RequestSentNotice({
  reference,
  serviceName,
  startsAt,
  customerEmail,
}: RequestSentNoticeProps) {
  const message = `Bonjour, je viens d’envoyer une demande de réservation sur le site : ${serviceName}, ${formatDateTime(startsAt)}. Référence ${reference}.`;
  const whatsappUrl = `${site.whatsapp.url}?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-lg border border-champagne/50 bg-champagne/10 p-6">
      <ol className="space-y-4 font-body text-sm leading-relaxed text-ivory-70">
        <li className="flex gap-4">
          <span aria-hidden className="font-body text-xs tracking-[0.2em] text-champagne">
            01
          </span>
          <span>
            Votre demande est arrivée au studio, et le créneau vous est retenu{' '}
            {site.requestHoldHours} heures.
          </span>
        </li>
        <li className="flex gap-4">
          <span aria-hidden className="font-body text-xs tracking-[0.2em] text-champagne">
            02
          </span>
          <span>
            Nous confirmons par email à {customerEmail}, ou sur WhatsApp si vous préférez.
          </span>
        </li>
        <li className="flex gap-4">
          <span aria-hidden className="font-body text-xs tracking-[0.2em] text-champagne">
            03
          </span>
          <span>Le règlement se fait sur place, le jour de la séance.</span>
        </li>
      </ol>

      {site.whatsapp.enabled && (
        <p className="mt-6 border-t border-champagne/40 pt-5 font-body text-sm text-ivory-70">
          Pour aller plus vite,{' '}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-champagne underline-offset-4 hover:text-ivory"
          >
            écrivez-nous sur WhatsApp
          </a>{' '}
          — le message est déjà prêt.
        </p>
      )}
    </div>
  );
}
