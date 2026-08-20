-- Données de lancement ALMA STUDIO.
-- Les tarifs sont des valeurs de départ, modifiables depuis l'administration.
-- Les avis sont des exemples de mise en page (is_sample = true).

insert into public.settings (key, value) values
  ('cancellation_hours', '24'::jsonb),
  ('reminder_hours', '24'::jsonb),
  ('minimum_notice_hours', '2'::jsonb),
  ('booking_horizon_days', '60'::jsonb),
  ('prep_minutes', '10'::jsonb),
  ('buffer_minutes', '15'::jsonb),
  ('slot_step_minutes', '15'::jsonb),
  ('hold_minutes', '15'::jsonb),
  ('home_service_enabled', 'true'::jsonb),
  ('sms_enabled', 'false'::jsonb)
on conflict (key) do nothing;

insert into public.business_hours (weekday, opens_at, closes_at, is_open) values
  (0, '10:00', '20:00', false),
  (1, '10:00', '20:00', true),
  (2, '10:00', '20:00', true),
  (3, '10:00', '20:00', true),
  (4, '10:00', '21:00', true),
  (5, '10:00', '21:00', true),
  (6, '10:00', '19:00', true)
on conflict (weekday) do nothing;

insert into public.locations (name, postal_codes, travel_fee_cents, travel_minutes) values
  ('Paris centre',
   array['75001','75002','75003','75004','75005','75006','75007','75008','75009'],
   2000, 30),
  ('Paris est & ouest',
   array['75010','75011','75012','75013','75014','75015','75016','75017','75018','75019','75020'],
   3000, 45);

with inserted as (
  insert into public.services
    (slug, name, short_description, description, intensity, recommended_for,
     image_url, image_alt, home_service_available, is_signature, sort_order)
  values
    ('signature-mediterranee', 'Signature Méditerranée',
     'Le massage emblématique du studio, fluide et enveloppant.',
     'Une expérience fluide et enveloppante inspirée de l’univers méditerranéen. Le rythme et la pression évoluent progressivement pour créer une sensation de relâchement général.',
     'moderee', 'Première visite au studio, besoin de relâchement global.',
     '/images/services/signature-mediterranee.jpg',
     'Massage du dos à l’huile, mains à plat le long de la colonne, dans une lumière de bougies.', true, true, 1),
    ('espagnol-evasion', 'Espagnol Évasion',
     'Une évasion inspirée de l’univers du bien-être espagnol.',
     'Une expérience de relaxation inspirée de l’univers du bien-être espagnol et méditerranéen, avec une gestuelle fluide et enveloppante.',
     'moderee', 'Envie de dépaysement et de lâcher-prise.',
     '/images/services/espagnol-evasion.jpg',
     'Séance de massage du dos dans une alcôve de pierre éclairée à la bougie, ouverte sur un patio.', true, true, 2),
    ('deep-relax', 'Deep Relax',
     'Une séance lente, pensée pour ralentir profondément.',
     'Une séance lente et apaisante pensée pour ralentir et favoriser une profonde sensation de détente.',
     'douce', 'Fatigue mentale, sommeil difficile, besoin de calme.',
     '/images/services/deep-relax.jpg',
     'Massage lent des épaules et du haut du dos, la personne allongée, visage détendu sur l’appui-tête.', true, true, 3),
    ('dos-nuque', 'Dos & Nuque',
     'Une séance ciblée, courte et efficace.',
     'Une séance ciblée autour du dos, des épaules et de la nuque.',
     'moderee', 'Journées assises, tensions d’épaules, pause en semaine.',
     '/images/services/dos-nuque.jpg',
     'Pression appuyée à la base de la nuque et sur le trapèze, serviettes roulées en arrière-plan.', false, false, 4),
    ('sport-recovery', 'Sport & Recovery',
     'Une séance plus dynamique, orientée récupération.',
     'Une séance plus dynamique destinée aux personnes qui souhaitent consacrer leur moment de bien-être à la récupération et au relâchement musculaire.',
     'dynamique', 'Après l’entraînement, jambes lourdes, reprise du sport.',
     '/images/services/sport-recovery.jpg',
     'Massage de récupération du mollet, gestuelle appuyée, après l’effort.', true, false, 5),
    ('rituel-mediterraneen', 'Rituel Méditerranéen',
     'L’expérience premium du studio, du début à la fin.',
     'L’expérience premium ALMA : préparation sensorielle, serviettes chaudes, massage complet et relaxation finale.',
     'douce', 'Occasion particulière, cadeau, moment long pour soi.',
     '/images/services/rituel-mediterraneen.jpg',
     'Fin de séance du rituel : mains posées sur les tempes, bougies et lanterne en arrière-plan.', false, false, 6)
  on conflict (slug) do nothing
  returning id, slug
)
insert into public.service_durations (service_id, minutes, price_cents, sort_order)
select i.id, d.minutes, d.price_cents, d.sort_order
from inserted i
join (values
  ('signature-mediterranee', 60, 9000, 1),
  ('signature-mediterranee', 90, 12500, 2),
  ('espagnol-evasion', 60, 9500, 1),
  ('espagnol-evasion', 90, 13000, 2),
  ('deep-relax', 60, 9000, 1),
  ('deep-relax', 90, 12500, 2),
  ('dos-nuque', 30, 5000, 1),
  ('dos-nuque', 45, 7000, 2),
  ('sport-recovery', 60, 10000, 1),
  ('sport-recovery', 90, 14000, 2),
  ('rituel-mediterraneen', 90, 15000, 1),
  ('rituel-mediterraneen', 120, 19500, 2)
) as d(slug, minutes, price_cents, sort_order) on d.slug = i.slug;

insert into public.reviews (author_name, rating, quote, service_label, is_published, is_sample) values
  ('Claire M.', 5, 'Un lieu calme et une écoute vraiment attentive. On ressort apaisé, sans se presser.', 'Signature Méditerranée', true, true),
  ('Thomas R.', 5, 'La pression a été ajustée exactement comme je le souhaitais. Rare et appréciable.', 'Sport & Recovery', true, true),
  ('Inès B.', 5, 'L’ambiance du studio fait la moitié du travail. On ralentit dès la porte franchie.', 'Rituel Méditerranéen', true, true);
