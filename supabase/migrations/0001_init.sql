-- ALMA STUDIO — schéma initial.
-- Convention : montants en centimes (bigint interdit ici, integer suffit),
-- instants en timestamptz, fuseau métier appliqué à l'affichage uniquement.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------- clients
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (length(trim(first_name)) between 1 and 80),
  last_name text not null check (length(trim(last_name)) between 1 and 80),
  email text not null check (position('@' in email) > 1),
  phone text not null,
  marketing_consent boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Un client est identifié par son email (insensible à la casse).
create unique index customers_email_key on public.customers (lower(email));

-- ----------------------------------------------------------- prestations
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  short_description text not null,
  description text not null,
  intensity text not null default 'moderee' check (intensity in ('douce', 'moderee', 'dynamique')),
  recommended_for text not null default '',
  image_url text,
  image_alt text not null default '',
  home_service_available boolean not null default false,
  is_active boolean not null default true,
  is_signature boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_active_idx on public.services (is_active, sort_order);

create table public.service_durations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  minutes integer not null check (minutes between 15 and 300),
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 100,
  unique (service_id, minutes)
);
create index service_durations_service_idx on public.service_durations (service_id, sort_order);

-- ------------------------------------------------- zones de déplacement
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  postal_codes text[] not null default '{}',
  travel_fee_cents integer not null default 0 check (travel_fee_cents >= 0),
  travel_minutes integer not null default 0 check (travel_minutes >= 0),
  is_active boolean not null default true
);

-- ------------------------------------------------------------- planning
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  is_open boolean not null default true,
  unique (weekday),
  check (closes_at > opens_at)
);

create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index blocked_slots_range_idx on public.blocked_slots using gist (tstzrange(starts_at, ends_at, '[)'));

-- --------------------------------------------------------- réservations
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  -- Référence lisible communiquée au client, ex. ALMA-7F3K2Q.
  reference text not null unique default 'ALMA-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6)),
  customer_id uuid not null references public.customers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  service_duration_id uuid not null references public.service_durations (id) on delete restrict,
  location_kind text not null check (location_kind in ('studio', 'home')),
  location_id uuid references public.locations (id) on delete set null,
  address jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- Fenêtre réellement occupée : préparation + soin + battement (+ trajet).
  blocks_from timestamptz not null,
  blocks_until timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'refunded', 'no_show')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  service_price_cents integer not null check (service_price_cents >= 0),
  travel_fee_cents integer not null default 0 check (travel_fee_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  promotion_code text,
  gift_card_code text,
  customer_note text,
  admin_note text,
  -- Jeton d'accès à la page « gérer ma réservation », transmis par email.
  manage_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  -- Tant que le paiement n'est pas confirmé, le créneau n'est retenu que
  -- jusqu'à cette échéance : au-delà, la retenue est purgée.
  hold_expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (blocks_until > blocks_from),
  -- Un déplacement à domicile exige une adresse et une zone.
  check (location_kind = 'studio' or (address is not null and location_id is not null))
);

-- Filet de sécurité contre les réservations simultanées : la base refuse
-- physiquement deux créneaux actifs qui se chevauchent. Les retenues
-- expirées sont purgées avant insertion par `create_booking_atomic`.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (tstzrange(blocks_from, blocks_until, '[)') with &&)
  where (status in ('pending', 'confirmed', 'completed'));

create index bookings_starts_at_idx on public.bookings (starts_at);
create index bookings_status_idx on public.bookings (status, starts_at);
create index bookings_customer_idx on public.bookings (customer_id, starts_at desc);
create index bookings_hold_idx on public.bookings (hold_expires_at) where status = 'pending';

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  kind text not null check (kind in ('service', 'travel_fee', 'discount', 'gift_card')),
  label text not null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);
create index booking_items_booking_idx on public.booking_items (booking_id);

-- -------------------------------------------------------------- paiement
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  gift_card_id uuid,
  provider text not null default 'stripe',
  provider_payment_id text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'eur',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  refunded_cents integer not null default 0 check (refunded_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

-- --------------------------------------------------------- cartes cadeaux
create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  initial_amount_cents integer not null check (initial_amount_cents > 0),
  balance_cents integer not null check (balance_cents >= 0),
  status text not null default 'active' check (status in ('active', 'redeemed', 'expired', 'cancelled')),
  service_label text,
  purchaser_name text not null,
  purchaser_email text not null,
  recipient_name text not null,
  recipient_email text,
  message text,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (balance_cents <= initial_amount_cents)
);
create index gift_cards_status_idx on public.gift_cards (status, expires_at);

alter table public.payments
  add constraint payments_gift_card_fk
  foreign key (gift_card_id) references public.gift_cards (id) on delete set null;

create table public.gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  amount_cents integer not null,
  kind text not null check (kind in ('issue', 'redeem', 'refund', 'adjustment')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ promotions
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('percentage', 'fixed')),
  value integer not null check (value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer check (max_redemptions > 0),
  times_redeemed integer not null default 0 check (times_redeemed >= 0),
  service_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'percentage' or value <= 100)
);

-- ----------------------------------------------------------------- avis
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  quote text not null,
  service_label text,
  is_published boolean not null default false,
  -- Marque les jeux de démonstration : jamais présentés comme de vrais avis.
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------- notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete cascade,
  gift_card_id uuid references public.gift_cards (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  template text not null,
  recipient text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'failed', 'skipped')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index notifications_pending_idx on public.notifications (status, scheduled_for);
-- Un même modèle n'est envoyé qu'une fois par réservation (rappels inclus).
create unique index notifications_unique_per_booking
  on public.notifications (booking_id, channel, template)
  where booking_id is not null;

-- ------------------------------------------------------------ RGPD
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete cascade,
  email text not null,
  kind text not null check (kind in ('booking_terms', 'marketing', 'cookies')),
  granted boolean not null,
  granted_at timestamptz not null default now(),
  source text
);

-- -------------------------------------------------------- configuration
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------- updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();
create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();
