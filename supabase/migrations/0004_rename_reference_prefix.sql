-- Renommage de la marque : ALMA STUDIO devient Alhambra Studio.
-- La référence de réservation générée côté base suit, ex. ALHAMBRA-7F3K2Q.
alter table public.bookings
  alter column reference
  set default 'ALHAMBRA-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6));
