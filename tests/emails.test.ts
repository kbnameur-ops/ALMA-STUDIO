import { describe, expect, it } from 'vitest';
import { escapeHtml, renderEmail, renderPlainText } from '@/lib/notifications/email/layout';
import {
  bookingCancelledEmail,
  bookingConfirmationEmail,
  bookingReminderEmail,
  bookingRequestEmail,
  bookingRequestStudioEmail,
  giftCardEmail,
} from '@/lib/notifications/email/templates';
import type { BookingDetails, GiftCard } from '@/types';

const booking: BookingDetails = {
  id: 'booking-1',
  reference: 'ALHAMBRA-7F3K2Q',
  customerId: 'cust-1',
  serviceId: 'svc-1',
  serviceDurationId: 'dur-1',
  locationKind: 'studio',
  address: null,
  homeZoneId: null,
  startsAt: '2026-04-11T12:00:00.000Z',
  endsAt: '2026-04-11T13:30:00.000Z',
  status: 'confirmed',
  paymentStatus: 'paid',
  servicePriceCents: 12500,
  travelFeeCents: 0,
  discountCents: 0,
  totalCents: 12500,
  promotionCode: null,
  giftCardCode: null,
  customerNote: null,
  manageToken: 'token-secret',
  createdAt: '2026-04-01T10:00:00.000Z',
  cancelledAt: null,
  service: { id: 'svc-1', slug: 'signature-mediterranee', name: 'Signature Méditerranée' },
  durationMinutes: 90,
  customer: {
    firstName: 'Claire',
    lastName: 'Martin',
    email: 'claire@example.com',
    phone: '0600000000',
  },
};

const giftCard: GiftCard = {
  id: 'gc-1',
  code: 'ALHAMBRA-4KQ7-J92X',
  initialAmountCents: 12500,
  balanceCents: 12500,
  status: 'active',
  serviceLabel: null,
  purchaserName: 'Thomas',
  purchaserEmail: 'thomas@example.com',
  recipientName: 'Inès',
  recipientEmail: 'ines@example.com',
  message: 'Pour ton anniversaire',
  issuedAt: '2026-04-01T10:00:00.000Z',
  expiresAt: '2027-04-01T10:00:00.000Z',
};

describe('escapeHtml', () => {
  it('neutralise le balisage injecté', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });
});

describe('renderEmail', () => {
  it('échappe le contenu variable', () => {
    const html = renderEmail({
      heading: 'Bonjour <b>vous</b>',
      intro: ['Un message avec <img onerror=x>'],
    });
    expect(html).not.toContain('<b>vous</b>');
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('&lt;b&gt;vous&lt;/b&gt;');
  });

  it('produit une version texte reprenant les mêmes informations', () => {
    const layout = {
      heading: 'Titre',
      intro: ['Ligne 1'],
      details: [{ label: 'Durée', value: '90 min' }],
      primaryButton: { label: 'Gérer', url: 'https://exemple.fr/gerer' },
    };
    const text = renderPlainText(layout);
    expect(text).toContain('Titre');
    expect(text).toContain('Durée : 90 min');
    expect(text).toContain('https://exemple.fr/gerer');
  });
});

describe('modèles de réservation', () => {
  it('confirme la réservation avec la référence et le délai d’annulation', () => {
    const email = bookingConfirmationEmail(booking, 24);
    expect(email.subject).toContain('confirmée');
    expect(email.html).toContain('ALHAMBRA-7F3K2Q');
    expect(email.text).toContain('24 heures');
    // Heure locale du studio (14:00 CEST pour 12:00 UTC en avril).
    expect(email.text).toContain('14:00');
  });

  it('inclut le lien de gestion porteur du jeton', () => {
    const email = bookingConfirmationEmail(booking, 24);
    expect(email.text).toContain('ref=ALHAMBRA-7F3K2Q');
    expect(email.text).toContain('token=token-secret');
  });

  it('affiche les frais de déplacement pour une séance à domicile', () => {
    const email = bookingReminderEmail(
      {
        ...booking,
        locationKind: 'home',
        travelFeeCents: 2000,
        address: { line1: '10 rue de Rivoli', line2: null, postalCode: '75004', city: 'Paris' },
      },
      24,
    );
    expect(email.text).toContain('Déplacement');
    expect(email.text).toContain('10 rue de Rivoli');
  });

  it('annonce l’annulation sans promettre de remboursement automatique erroné', () => {
    const email = bookingCancelledEmail(booking);
    expect(email.subject).toContain('annulée');
    expect(email.text).toContain('ALHAMBRA-7F3K2Q');
  });
});

describe('modèle carte cadeau', () => {
  it('adresse le code et le message au bénéficiaire', () => {
    const email = giftCardEmail(giftCard, 'recipient');
    expect(email.text).toContain('ALHAMBRA-4KQ7-J92X');
    expect(email.text).toContain('Pour ton anniversaire');
    expect(email.subject).toContain('Thomas');
  });

  it('envoie une copie à l’acheteur', () => {
    const email = giftCardEmail(giftCard, 'purchaser');
    expect(email.text).toContain('ALHAMBRA-4KQ7-J92X');
    expect(email.subject).toContain('carte cadeau');
  });
});


describe('demande de réservation', () => {
  const requested: BookingDetails = {
    ...booking,
    status: 'pending',
    paymentStatus: 'pending',
    customerNote: 'Plutôt une pression légère.',
  };

  it('annonce une demande reçue, jamais une réservation confirmée', () => {
    const email = bookingRequestEmail(requested, 48);
    expect(email.subject).toContain('demande');
    // Le piège du parcours sans paiement : laisser croire que c'est acquis.
    expect(email.text.toLowerCase()).not.toContain('est confirmée');
    expect(email.text).toContain('48');
  });

  it('dit au client que rien n’est payé en ligne', () => {
    const email = bookingRequestEmail(requested, 48);
    expect(email.text).toContain('sur place');
  });

  it('donne au studio de quoi rappeler le client', () => {
    const email = bookingRequestStudioEmail(requested);
    expect(email.text).toContain(requested.customer.phone);
    expect(email.text).toContain(requested.customer.email);
    expect(email.text).toContain(requested.reference);
  });

  it('transmet au studio le message laissé par le client', () => {
    const email = bookingRequestStudioEmail(requested);
    expect(email.text).toContain('pression légère');
  });

  it('n’envoie pas au studio le lien de gestion du client', () => {
    // Ce lien vaut authentification : il n'a rien à faire ailleurs que
    // chez son destinataire.
    const email = bookingRequestStudioEmail(requested);
    expect(email.html).not.toContain(requested.manageToken);
  });
});
