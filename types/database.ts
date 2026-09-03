/**
 * Typage de la base Supabase.
 *
 * Écrit à la main pour rester lisible et versionné avec les migrations
 * (`supabase/migrations`). Il peut être régénéré par
 * `supabase gen types typescript` ; garder la même forme `Row/Insert/Update`.
 */

import type { Json } from './json';

export type { Json };

/** Clé étrangère déclarée, utilisée par supabase-js pour typer les jointures. */
type Relationship<Column extends string, Referenced extends string> = {
  foreignKeyName: string;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Referenced;
  referencedColumns: ['id'];
};

type TableShape<
  Row,
  Insert = Partial<Row>,
  Update = Partial<Row>,
  Rels extends readonly unknown[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rels;
}

export type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  marketing_consent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  intensity: 'douce' | 'moderee' | 'dynamique';
  recommended_for: string;
  image_url: string | null;
  image_alt: string;
  home_service_available: boolean;
  is_active: boolean;
  is_signature: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ServiceDurationRow = {
  id: string;
  service_id: string;
  minutes: number;
  price_cents: number;
  is_active: boolean;
  sort_order: number;
}

export type LocationRow = {
  id: string;
  name: string;
  postal_codes: string[];
  travel_fee_cents: number;
  travel_minutes: number;
  is_active: boolean;
}

export type BusinessHourRow = {
  id: string;
  weekday: number;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
}

export type BlockedSlotRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
}

export type BookingRow = {
  id: string;
  reference: string;
  customer_id: string;
  service_id: string;
  service_duration_id: string;
  location_kind: 'studio' | 'home';
  location_id: string | null;
  address: Json | null;
  starts_at: string;
  ends_at: string;
  /** Fenêtre occupée réellement (préparation + soin + battement + trajet). */
  blocks_from: string;
  blocks_until: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded' | 'no_show';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  service_price_cents: number;
  travel_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  promotion_code: string | null;
  gift_card_code: string | null;
  customer_note: string | null;
  admin_note: string | null;
  manage_token: string;
  /** Expiration de la retenue de créneau tant que le paiement n'est pas confirmé. */
  hold_expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingItemRow = {
  id: string;
  booking_id: string;
  kind: 'service' | 'travel_fee' | 'discount' | 'gift_card';
  label: string;
  amount_cents: number;
  created_at: string;
}

export type PaymentRow = {
  id: string;
  booking_id: string | null;
  gift_card_id: string | null;
  provider: string;
  provider_payment_id: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  refunded_cents: number;
  created_at: string;
  updated_at: string;
}

export type GiftCardRow = {
  id: string;
  code: string;
  initial_amount_cents: number;
  balance_cents: number;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  service_label: string | null;
  purchaser_name: string;
  purchaser_email: string;
  recipient_name: string;
  recipient_email: string | null;
  message: string | null;
  issued_at: string;
  expires_at: string;
  created_at: string;
}

export type GiftCardTransactionRow = {
  id: string;
  gift_card_id: string;
  booking_id: string | null;
  amount_cents: number;
  kind: 'issue' | 'redeem' | 'refund' | 'adjustment';
  created_at: string;
}

export type PromotionRow = {
  id: string;
  code: string;
  kind: 'percentage' | 'fixed';
  value: number;
  starts_at: string | null;
  ends_at: string | null;
  max_redemptions: number | null;
  times_redeemed: number;
  service_ids: string[];
  is_active: boolean;
  created_at: string;
}

export type ReviewRow = {
  id: string;
  author_name: string;
  rating: number;
  quote: string;
  service_label: string | null;
  is_published: boolean;
  is_sample: boolean;
  created_at: string;
}

export type NotificationRow = {
  id: string;
  booking_id: string | null;
  gift_card_id: string | null;
  channel: 'email' | 'sms';
  template: string;
  recipient: string;
  status: 'scheduled' | 'sent' | 'failed' | 'skipped';
  scheduled_for: string | null;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export type ConsentRow = {
  id: string;
  customer_id: string | null;
  email: string;
  kind: 'booking_terms' | 'marketing' | 'cookies';
  granted: boolean;
  granted_at: string;
  source: string | null;
}

export type SettingRow = {
  key: string;
  value: Json;
  updated_at: string;
}

export type AdminUserRow = {
  id: string;
  email: string;
  role: 'owner' | 'staff';
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      customers: TableShape<CustomerRow, Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
      services: TableShape<ServiceRow, Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
      service_durations: TableShape<
        ServiceDurationRow,
        Omit<ServiceDurationRow, 'id'> & { id?: string },
        Partial<ServiceDurationRow>,
        [Relationship<'service_id', 'services'>]
      >;
      locations: TableShape<LocationRow, Omit<LocationRow, 'id'> & { id?: string }>;
      business_hours: TableShape<BusinessHourRow, Omit<BusinessHourRow, 'id'> & { id?: string }>;
      blocked_slots: TableShape<BlockedSlotRow, Omit<BlockedSlotRow, 'id' | 'created_at'> & { id?: string }>;
      bookings: TableShape<
        BookingRow,
        Omit<BookingRow, 'id' | 'created_at' | 'updated_at' | 'reference' | 'manage_token'> & {
          id?: string;
          reference?: string;
          manage_token?: string;
        },
        Partial<BookingRow>,
        [
          Relationship<'customer_id', 'customers'>,
          Relationship<'service_id', 'services'>,
          Relationship<'service_duration_id', 'service_durations'>,
          Relationship<'location_id', 'locations'>,
        ]
      >;
      booking_items: TableShape<
        BookingItemRow,
        Omit<BookingItemRow, 'id' | 'created_at'> & { id?: string },
        Partial<BookingItemRow>,
        [Relationship<'booking_id', 'bookings'>]
      >;
      payments: TableShape<PaymentRow, Omit<PaymentRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
      gift_cards: TableShape<GiftCardRow, Omit<GiftCardRow, 'id' | 'created_at'> & { id?: string }>;
      gift_card_transactions: TableShape<
        GiftCardTransactionRow,
        Omit<GiftCardTransactionRow, 'id' | 'created_at'> & { id?: string }
      >;
      promotions: TableShape<PromotionRow, Omit<PromotionRow, 'id' | 'created_at'> & { id?: string }>;
      reviews: TableShape<ReviewRow, Omit<ReviewRow, 'id' | 'created_at'> & { id?: string }>;
      notifications: TableShape<NotificationRow, Omit<NotificationRow, 'id' | 'created_at'> & { id?: string }>;
      consents: TableShape<ConsentRow, Omit<ConsentRow, 'id'> & { id?: string }>;
      settings: TableShape<SettingRow, SettingRow>;
      admin_users: TableShape<AdminUserRow, Omit<AdminUserRow, 'created_at'>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      /** Réservation transactionnelle : voir `supabase/migrations`. */
      create_booking_atomic: {
        Args: { payload: Json };
        Returns: Json;
      };
      /** Confirmation après webhook Stripe, idempotente. */
      confirm_booking_paid: {
        Args: { p_booking_id: string; p_provider_payment_id: string; p_amount_cents: number };
        Returns: Json;
      };
      /** Débit d'une carte cadeau, avec écriture du mouvement. */
      redeem_gift_card: {
        Args: { p_code: string; p_amount_cents: number; p_booking_id: string };
        Returns: Json;
      };
      /** Incrément du compteur d'utilisation d'un code promotionnel. */
      redeem_promotion: {
        Args: { p_code: string };
        Returns: undefined;
      };
      /** Purge des retenues de créneau expirées. */
      purge_expired_holds: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
