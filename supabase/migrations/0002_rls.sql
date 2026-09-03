-- Politiques d'accès.
--
-- Principe : le public ne lit que le catalogue et les avis publiés ; il
-- n'écrit jamais directement. Toute écriture de réservation, paiement ou
-- carte cadeau passe par le serveur applicatif (clé service_role), après
-- validation et calcul de prix côté serveur.

alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.service_durations enable row level security;
alter table public.locations enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.payments enable row level security;
alter table public.gift_cards enable row level security;
alter table public.gift_card_transactions enable row level security;
alter table public.promotions enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.consents enable row level security;
alter table public.settings enable row level security;
alter table public.admin_users enable row level security;

-- Un membre de l'équipe est un utilisateur authentifié listé dans admin_users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

-- Lecture publique du catalogue.
create policy "catalogue lisible" on public.services
  for select using (is_active or public.is_admin());
create policy "durées lisibles" on public.service_durations
  for select using (
    public.is_admin()
    or exists (select 1 from public.services s where s.id = service_id and s.is_active)
  );
create policy "zones lisibles" on public.locations
  for select using (is_active or public.is_admin());
create policy "horaires lisibles" on public.business_hours
  for select using (true);
-- Les motifs d'indisponibilité ne sont pas publics ; seule l'occupation
-- l'est, et elle est calculée côté serveur. On restreint donc la lecture.
create policy "indisponibilités admin" on public.blocked_slots
  for select using (public.is_admin());
create policy "avis publiés lisibles" on public.reviews
  for select using (is_published or public.is_admin());
create policy "réglages lisibles" on public.settings
  for select using (true);

-- Accès complet pour l'équipe.
create policy "admin services" on public.services for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin durées" on public.service_durations for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin zones" on public.locations for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin horaires" on public.business_hours for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin indisponibilités" on public.blocked_slots for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin clients" on public.customers for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin réservations" on public.bookings for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin lignes" on public.booking_items for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin paiements" on public.payments for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin cartes cadeaux" on public.gift_cards for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin mouvements cartes" on public.gift_card_transactions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin promotions" on public.promotions for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin avis" on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin notifications" on public.notifications for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin consentements" on public.consents for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin réglages" on public.settings for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admin annuaire" on public.admin_users
  for select using (public.is_admin());

-- Aucune policy d'écriture publique n'est déclarée : sans policy, RLS
-- refuse. Les écritures légitimes utilisent la clé service_role, qui
-- contourne RLS et n'est jamais exposée au navigateur.
