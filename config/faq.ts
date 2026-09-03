import { site } from './site';

/**
 * Questions fréquentes.
 * Centralisées ici pour alimenter à la fois la page FAQ et son JSON-LD,
 * sans dupliquer les textes.
 */
export interface FaqItem {
  question: string;
  answer: string;
  category: 'Réservation' | 'La séance' | 'Praticien & studio' | 'Paiement';
}

export const faqItems: FaqItem[] = [
  {
    category: 'Réservation',
    question: 'Comment réserver une séance ?',
    answer: site.onlinePaymentEnabled
      ? 'La réservation se fait en ligne, en quelques étapes : prestation, durée, lieu, créneau, puis paiement. La confirmation est immédiate et vous recevez un email récapitulatif.'
      : `Vous choisissez en ligne votre prestation, sa durée, le lieu et le créneau, puis vous envoyez votre demande. Le créneau vous est retenu ${site.requestHoldHours} heures et nous la confirmons par email ou WhatsApp. Aucun paiement n’est demandé en ligne.`,
  },
  {
    category: 'Réservation',
    question: 'Puis-je modifier ou annuler ma réservation ?',
    answer: `Oui. La modification et l’annulation sont sans frais jusqu’à ${site.cancellationHours} heures avant le rendez-vous, depuis le lien « Gérer ma réservation » présent dans votre email de confirmation.`,
  },
  {
    category: 'Réservation',
    question: 'Que se passe-t-il si je suis en retard ?',
    answer:
      'La séance se termine à l’heure prévue afin de ne pas décaler le rendez-vous suivant. Prévenez-nous dès que possible : nous ferons au mieux dans le temps restant.',
  },
  {
    category: 'La séance',
    question: 'Comment se déroule une première séance ?',
    answer:
      'Un court échange permet de comprendre vos attentes et vos préférences. La séance est ensuite ajustée en rythme et en pression, puis se termine progressivement pour prolonger la détente.',
  },
  {
    category: 'La séance',
    question: 'Que dois-je prévoir ?',
    answer:
      'Rien de particulier : tout le linge nécessaire est fourni. Venez simplement avec un peu d’avance pour ne pas commencer dans la précipitation.',
  },
  {
    category: 'La séance',
    question: 'S’agit-il d’un massage thérapeutique ?',
    answer:
      'Non. Les prestations proposées sont des massages de bien-être et de relaxation. Elles ne constituent ni un acte médical, ni un soin thérapeutique, et ne remplacent en aucun cas un avis de santé.',
  },
  {
    category: 'Praticien & studio',
    question: 'Le studio reçoit-il plusieurs personnes en même temps ?',
    answer:
      'Non. Le studio est privé et n’accueille qu’un seul rendez-vous à la fois, pour préserver le calme et la confidentialité de chaque séance.',
  },
  {
    category: 'Praticien & studio',
    question: 'Proposez-vous des séances à domicile ?',
    answer:
      'Certaines expériences peuvent être proposées à domicile, selon votre adresse et nos disponibilités. La zone est vérifiée pendant la réservation et les frais de déplacement s’affichent avant validation.',
  },
  {
    category: 'Paiement',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: site.onlinePaymentEnabled
      ? 'Le paiement s’effectue en ligne par carte bancaire, de façon sécurisée, au moment de la réservation. Les cartes cadeaux Alhambra sont acceptées lors de la réservation.'
      : 'Le règlement se fait sur place, le jour de la séance. Aucun paiement n’est demandé en ligne au moment de la demande. Les cartes cadeaux Alhambra sont acceptées.',
  },
  {
    category: 'Paiement',
    question: 'Combien de temps une carte cadeau est-elle valable ?',
    answer:
      'Une carte cadeau Alhambra est valable douze mois à compter de sa date d’émission. Elle peut être utilisée sur n’importe quelle prestation du studio.',
  },
];
