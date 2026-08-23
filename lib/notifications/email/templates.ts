import { brand } from '@/config/brand';
import { site, studioAddressLine } from '@/config/site';
import { formatDateTime, formatDuration, formatPrice } from '@/lib/utils/format';
import type { BookingDetails, GiftCard } from '@/types';
import { renderEmail, renderPlainText, type EmailLayoutInput } from './layout';

/**
 * Modèles d'emails ALMA.
 *
 * Chaque modèle produit un sujet, un HTML et une version texte, à partir
 * des mêmes données : impossible d'oublier de mettre l'un des deux à jour.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export type BookingTemplate =
  | 'booking_request'
  | 'booking_request_studio'
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_updated'
  | 'booking_cancelled'
  | 'booking_refunded'
  | 'review_request';

function render(subject: string, layout: EmailLayoutInput): RenderedEmail {
  return { subject, html: renderEmail(layout), text: renderPlainText(layout) };
}

function manageUrl(booking: BookingDetails): string {
  return `${site.url}/reservation/gerer?ref=${booking.reference}&token=${booking.manageToken}`;
}

function locationLabel(booking: BookingDetails): string {
  if (booking.locationKind === 'studio') {
    return `Au studio — ${studioAddressLine()}`;
  }
  const address = booking.address;
  return address
    ? `À domicile — ${address.line1}, ${address.postalCode} ${address.city}`
    : 'À domicile';
}

function bookingDetails(booking: BookingDetails): Array<{ label: string; value: string }> {
  const rows = [
    { label: 'Prestation', value: booking.service.name },
    { label: 'Durée', value: formatDuration(booking.durationMinutes) },
    { label: 'Date', value: formatDateTime(booking.startsAt) },
    { label: 'Lieu', value: locationLabel(booking) },
  ];
  if (booking.travelFeeCents > 0) {
    rows.push({ label: 'Déplacement', value: formatPrice(booking.travelFeeCents) });
  }
  if (booking.discountCents > 0) {
    rows.push({ label: 'Réduction', value: `− ${formatPrice(booking.discountCents)}` });
  }
  rows.push({ label: 'Total', value: formatPrice(booking.totalCents) });
  rows.push({ label: 'Référence', value: booking.reference });
  return rows;
}

/**
 * Accusé de réception d'une demande, côté client.
 *
 * Ne jamais employer le mot « confirmée » ici : rien ne l'est tant que le
 * studio n'a pas répondu. Le créneau est retenu, c'est tout, et l'email le
 * dit avec la durée exacte de cette retenue.
 */
export function bookingRequestEmail(booking: BookingDetails, holdHours: number): RenderedEmail {
  return render(`Nous avons bien reçu votre demande — ${brand.name}`, {
    heading: 'Votre demande est bien arrivée.',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      `Le créneau est retenu à votre nom. Nous revenons vers vous par email ou WhatsApp pour le confirmer, sous ${holdHours} heures au plus tard.`,
    ],
    details: bookingDetails(booking),
    primaryButton: { label: 'Suivre ma demande', url: manageUrl(booking) },
    outro: [
      'Aucun paiement n’est demandé en ligne : le règlement se fait sur place, le jour de la séance.',
      `Une question d’ici là : ${site.contactPhone} — également joignable sur WhatsApp.`,
      'Prestation de bien-être et de relaxation, sans visée thérapeutique.',
    ],
  });
}

/** La même demande, adressée au studio : tout ce qu'il faut pour rappeler. */
export function bookingRequestStudioEmail(booking: BookingDetails): RenderedEmail {
  const rows = bookingDetails(booking);
  rows.unshift(
    { label: 'Client', value: `${booking.customer.firstName} ${booking.customer.lastName}` },
    { label: 'Téléphone', value: booking.customer.phone },
    { label: 'Email', value: booking.customer.email },
  );
  if (booking.customerNote) {
    rows.push({ label: 'Message', value: booking.customerNote });
  }
  return render(
    `Demande de réservation — ${booking.service.name}, ${formatDateTime(booking.startsAt)}`,
    {
      heading: 'Nouvelle demande de réservation.',
      intro: [
        'Une demande vient d’arriver depuis le site. Le créneau est retenu en attendant votre réponse.',
      ],
      details: rows,
      primaryButton: { label: 'Ouvrir le back-office', url: `${site.url}/admin/reservations` },
      outro: [
        'Confirmez la réservation depuis le back-office : le client reçoit alors son email de confirmation.',
      ],
    },
  );
}

export function bookingConfirmationEmail(
  booking: BookingDetails,
  cancellationHours: number,
): RenderedEmail {
  return render(`Votre réservation est confirmée — ${brand.name}`, {
    heading: 'Votre réservation est confirmée.',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      `Votre séance est réservée. Voici le récapitulatif, à conserver précieusement.`,
    ],
    details: bookingDetails(booking),
    primaryButton: { label: 'Gérer ma réservation', url: manageUrl(booking) },
    outro: [
      `Modification ou annulation sans frais jusqu’à ${cancellationHours} heures avant le rendez-vous.`,
      'Présentez-vous quelques minutes avant l’heure : le temps de poser vos affaires et de commencer sans précipitation.',
      'Prestation de bien-être et de relaxation, sans visée thérapeutique.',
    ],
  });
}

export function bookingReminderEmail(
  booking: BookingDetails,
  cancellationHours: number,
): RenderedEmail {
  return render(`Rappel — votre séance ${brand.name}`, {
    heading: 'À demain.',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      'Un petit rappel de votre séance, prévue prochainement.',
    ],
    details: bookingDetails(booking),
    primaryButton: { label: 'Gérer ma réservation', url: manageUrl(booking) },
    outro: [
      `Un empêchement ? Vous pouvez encore modifier ou annuler sans frais jusqu’à ${cancellationHours} heures avant le rendez-vous.`,
    ],
  });
}

export function bookingUpdatedEmail(booking: BookingDetails): RenderedEmail {
  return render(`Votre réservation a été modifiée — ${brand.name}`, {
    heading: 'Votre réservation a été modifiée.',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      'Voici le récapitulatif à jour de votre séance.',
    ],
    details: bookingDetails(booking),
    primaryButton: { label: 'Voir ma réservation', url: manageUrl(booking) },
  });
}

export function bookingCancelledEmail(booking: BookingDetails): RenderedEmail {
  return render(`Votre réservation a été annulée — ${brand.name}`, {
    heading: 'Votre réservation a été annulée.',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      'Votre séance a bien été annulée. Le créneau est de nouveau disponible.',
    ],
    details: [
      { label: 'Prestation', value: booking.service.name },
      { label: 'Date initiale', value: formatDateTime(booking.startsAt) },
      { label: 'Référence', value: booking.reference },
    ],
    primaryButton: { label: 'Réserver une nouvelle séance', url: `${site.url}/reservation` },
    outro: ['Si un remboursement est dû, il est traité automatiquement sur le moyen de paiement d’origine.'],
  });
}

export function bookingRefundedEmail(booking: BookingDetails, amountCents: number): RenderedEmail {
  return render(`Remboursement effectué — ${brand.name}`, {
    heading: 'Votre remboursement a été effectué.',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      'Le remboursement de votre séance a été transmis à votre banque. Le délai d’affichage dépend de votre établissement, généralement quelques jours ouvrés.',
    ],
    details: [
      { label: 'Prestation', value: booking.service.name },
      { label: 'Montant remboursé', value: formatPrice(amountCents) },
      { label: 'Référence', value: booking.reference },
    ],
  });
}

export function reviewRequestEmail(booking: BookingDetails): RenderedEmail {
  return render(`Merci pour votre visite — ${brand.name}`, {
    heading: 'Comment vous sentez-vous ?',
    intro: [
      `Bonjour ${booking.customer.firstName},`,
      'Merci d’être venu au studio. Si vous avez un instant, votre retour nous aide à ajuster chaque détail.',
    ],
    primaryButton: { label: 'Laisser un avis', url: `${site.url}/avis?ref=${booking.reference}` },
    outro: ['Vous ne recevrez qu’un seul message de ce type par visite.'],
  });
}

export function giftCardEmail(
  card: GiftCard,
  audience: 'purchaser' | 'recipient',
): RenderedEmail {
  const validity = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: site.timezone,
  }).format(new Date(card.expiresAt));

  const details = [
    { label: 'Valeur', value: card.serviceLabel ?? formatPrice(card.initialAmountCents) },
    { label: 'Bénéficiaire', value: card.recipientName },
    { label: 'Valable jusqu’au', value: validity },
  ];

  if (audience === 'recipient') {
    return render(`${card.purchaserName} vous offre une parenthèse — ${brand.name}`, {
      heading: 'Une parenthèse vous attend.',
      intro: [
        `Bonjour ${card.recipientName},`,
        `${card.purchaserName} vous offre une séance au studio ${brand.name}.`,
        ...(card.message ? [`« ${card.message} »`] : []),
      ],
      highlight: {
        label: 'Votre code',
        value: card.code,
        note: 'À saisir lors de la réservation, à l’étape du paiement.',
      },
      details,
      primaryButton: { label: 'Réserver ma séance', url: `${site.url}/reservation` },
      outro: ['La carte est utilisable en une ou plusieurs fois, jusqu’à épuisement du solde.'],
    });
  }

  return render(`Votre carte cadeau ${brand.name}`, {
    heading: 'Votre carte cadeau est prête.',
    intro: [
      `Bonjour ${card.purchaserName},`,
      card.recipientEmail
        ? `La carte a été envoyée à ${card.recipientName}. Voici votre copie.`
        : `Voici le code à transmettre à ${card.recipientName}.`,
    ],
    highlight: { label: 'Code carte cadeau', value: card.code },
    details,
    outro: ['Merci de votre confiance.'],
  });
}
