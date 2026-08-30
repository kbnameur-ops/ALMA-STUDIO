import { Badge } from '@/components/ui/Badge';
import type { BookingStatus, PaymentStatus } from '@/types';

const bookingLabels: Record<BookingStatus, { label: string; tone: 'neutral' | 'accent' | 'sage' | 'outline' }> = {
  pending: { label: 'En attente', tone: 'outline' },
  confirmed: { label: 'Confirmée', tone: 'sage' },
  completed: { label: 'Terminée', tone: 'neutral' },
  cancelled: { label: 'Annulée', tone: 'accent' },
  refunded: { label: 'Remboursée', tone: 'accent' },
  no_show: { label: 'Non honorée', tone: 'accent' },
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: 'Paiement en attente',
  paid: 'Payée',
  failed: 'Paiement échoué',
  refunded: 'Remboursée',
  partially_refunded: 'Partiellement remboursée',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const entry = bookingLabels[status];
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return paymentLabels[status];
}
