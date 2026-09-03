-- Réservation transactionnelle et utilitaires de planning.

-- Libère les retenues de créneau dont le paiement n'a jamais abouti.
create or replace function public.purge_expired_holds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  with expired as (
    delete from public.bookings
    where status = 'pending'
      and hold_expires_at is not null
      and hold_expires_at < now()
    returning 1
  )
  select count(*) into removed from expired;
  return removed;
end;
$$;

/**
 * Crée une réservation de façon atomique.
 *
 * Le prix n'est jamais repris tel quel depuis l'appelant : la fonction
 * relit `service_durations.price_cents` et `locations.travel_fee_cents`
 * en base, et recalcule le total. La remise est plafonnée au montant
 * facturable pour éviter tout total négatif.
 *
 * En cas de collision avec un créneau déjà occupé, la contrainte
 * d'exclusion lève une exception convertie ici en erreur applicative
 * `SLOT_TAKEN` — c'est le point unique de résolution des réservations
 * simultanées.
 *
 * payload attendu :
 *  { customer: {first_name,last_name,email,phone,marketing_consent},
 *    service_id, service_duration_id, location_kind, location_id, address,
 *    starts_at, prep_minutes, buffer_minutes, discount_cents,
 *    promotion_code, gift_card_code, customer_note, hold_minutes }
 */
create or replace function public.create_booking_atomic(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_service public.services%rowtype;
  v_duration public.service_durations%rowtype;
  v_zone public.locations%rowtype;
  v_location_kind text := payload->>'location_kind';
  v_starts_at timestamptz := (payload->>'starts_at')::timestamptz;
  v_ends_at timestamptz;
  v_prep integer := coalesce((payload->>'prep_minutes')::integer, 0);
  v_buffer integer := coalesce((payload->>'buffer_minutes')::integer, 0);
  v_travel integer := 0;
  v_discount integer := greatest(coalesce((payload->>'discount_cents')::integer, 0), 0);
  v_billable integer;
  v_total integer;
  v_hold integer := coalesce((payload->>'hold_minutes')::integer, 15);
  v_booking public.bookings%rowtype;
begin
  perform public.purge_expired_holds();

  select * into v_service from public.services
    where id = (payload->>'service_id')::uuid and is_active;
  if not found then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select * into v_duration from public.service_durations
    where id = (payload->>'service_duration_id')::uuid
      and service_id = v_service.id
      and is_active;
  if not found then
    raise exception 'DURATION_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if v_location_kind not in ('studio', 'home') then
    raise exception 'LOCATION_INVALID' using errcode = 'P0001';
  end if;

  if v_location_kind = 'home' then
    if not v_service.home_service_available then
      raise exception 'HOME_SERVICE_UNAVAILABLE' using errcode = 'P0001';
    end if;
    select * into v_zone from public.locations
      where id = (payload->>'location_id')::uuid and is_active;
    if not found then
      raise exception 'ZONE_UNAVAILABLE' using errcode = 'P0001';
    end if;
    v_travel := v_zone.travel_fee_cents;
    -- Le trajet aller-retour est réservé dans le planning, pas facturé deux fois.
    v_prep := v_prep + v_zone.travel_minutes;
    v_buffer := v_buffer + v_zone.travel_minutes;
  end if;

  v_ends_at := v_starts_at + make_interval(mins => v_duration.minutes);
  v_billable := v_duration.price_cents + v_travel;
  v_discount := least(v_discount, v_billable);
  v_total := v_billable - v_discount;

  -- Le client est identifié par son email : on met à jour ses coordonnées
  -- plutôt que de créer un doublon à chaque réservation.
  insert into public.customers (first_name, last_name, email, phone, marketing_consent)
  values (
    payload->'customer'->>'first_name',
    payload->'customer'->>'last_name',
    lower(payload->'customer'->>'email'),
    payload->'customer'->>'phone',
    coalesce((payload->'customer'->>'marketing_consent')::boolean, false)
  )
  on conflict (lower(email)) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        phone = excluded.phone,
        marketing_consent = public.customers.marketing_consent or excluded.marketing_consent
  returning id into v_customer_id;

  begin
    insert into public.bookings (
      customer_id, service_id, service_duration_id, location_kind, location_id,
      address, starts_at, ends_at, blocks_from, blocks_until,
      status, payment_status, service_price_cents, travel_fee_cents,
      discount_cents, total_cents, promotion_code, gift_card_code,
      customer_note, hold_expires_at
    ) values (
      v_customer_id, v_service.id, v_duration.id, v_location_kind,
      case when v_location_kind = 'home' then v_zone.id else null end,
      case when v_location_kind = 'home' then payload->'address' else null end,
      v_starts_at, v_ends_at,
      v_starts_at - make_interval(mins => v_prep),
      v_ends_at + make_interval(mins => v_buffer),
      'pending', 'pending', v_duration.price_cents, v_travel,
      v_discount, v_total,
      nullif(payload->>'promotion_code', ''),
      nullif(payload->>'gift_card_code', ''),
      nullif(payload->>'customer_note', ''),
      now() + make_interval(mins => v_hold)
    )
    returning * into v_booking;
  exception
    when exclusion_violation then
      raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end;

  insert into public.booking_items (booking_id, kind, label, amount_cents)
  values (v_booking.id, 'service',
          v_service.name || ' — ' || v_duration.minutes || ' min',
          v_duration.price_cents);

  if v_travel > 0 then
    insert into public.booking_items (booking_id, kind, label, amount_cents)
    values (v_booking.id, 'travel_fee', 'Déplacement — ' || v_zone.name, v_travel);
  end if;

  if v_discount > 0 then
    insert into public.booking_items (booking_id, kind, label, amount_cents)
    values (
      v_booking.id,
      case when payload->>'gift_card_code' is not null and payload->>'gift_card_code' <> ''
           then 'gift_card' else 'discount' end,
      coalesce(nullif(payload->>'promotion_code', ''), nullif(payload->>'gift_card_code', ''), 'Remise'),
      -v_discount
    );
  end if;

  return to_jsonb(v_booking);
end;
$$;

/**
 * Confirme une réservation après validation du paiement par le webhook.
 * Idempotente : rejouer le même événement Stripe ne change rien.
 */
create or replace function public.confirm_booking_paid(
  p_booking_id uuid,
  p_provider_payment_id text,
  p_amount_cents integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
begin
  update public.bookings
     set status = case when status = 'pending' then 'confirmed' else status end,
         payment_status = 'paid',
         hold_expires_at = null
   where id = p_booking_id
  returning * into v_booking;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.payments (booking_id, provider, provider_payment_id, amount_cents, status)
  values (p_booking_id, 'stripe', p_provider_payment_id, p_amount_cents, 'paid')
  on conflict (provider, provider_payment_id)
  do update set status = 'paid', amount_cents = excluded.amount_cents;

  return to_jsonb(v_booking);
end;
$$;

/** Débite une carte cadeau et trace le mouvement. */
create or replace function public.redeem_gift_card(
  p_code text,
  p_amount_cents integer,
  p_booking_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.gift_cards%rowtype;
begin
  select * into v_card from public.gift_cards
    where upper(code) = upper(p_code) for update;

  if not found then
    raise exception 'GIFT_CARD_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_card.status <> 'active' or v_card.expires_at < now() then
    raise exception 'GIFT_CARD_INACTIVE' using errcode = 'P0001';
  end if;
  if v_card.balance_cents < p_amount_cents then
    raise exception 'GIFT_CARD_INSUFFICIENT' using errcode = 'P0001';
  end if;

  update public.gift_cards
     set balance_cents = balance_cents - p_amount_cents,
         status = case when balance_cents - p_amount_cents = 0 then 'redeemed' else status end
   where id = v_card.id
  returning * into v_card;

  insert into public.gift_card_transactions (gift_card_id, booking_id, amount_cents, kind)
  values (v_card.id, p_booking_id, -p_amount_cents, 'redeem');

  return to_jsonb(v_card);
end;
$$;

/** Incrémente le compteur d'utilisation d'un code promotionnel. */
create or replace function public.redeem_promotion(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.promotions
     set times_redeemed = times_redeemed + 1
   where upper(code) = upper(p_code);
$$;

revoke execute on function public.create_booking_atomic(jsonb) from anon, authenticated;
revoke execute on function public.confirm_booking_paid(uuid, text, integer) from anon, authenticated;
revoke execute on function public.redeem_gift_card(text, integer, uuid) from anon, authenticated;
revoke execute on function public.redeem_promotion(text) from anon, authenticated;
revoke execute on function public.purge_expired_holds() from anon, authenticated;
