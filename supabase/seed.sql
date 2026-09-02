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
    ('sevilla-calor', 'Sevilla Calor',
     'Gestuelle andalouse et huile chaude, entre tension et relâchement.',
     'Une gestuelle andalouse portée par une huile chaude : le rythme alterne tension et relâchement, inspiré de la cadence du flamenco.',
     'dynamique', 'Envie de chaleur, de rythme et de dépaysement.',
     '/images/services/espagnol-evasion-3.jpg',
     'Séance au studio : pierres chaudes alignées le long de la colonne, le praticien en prend une nouvelle dans une coupe.', true, true, 2),
    ('cote-atlantique', 'Côte Atlantique',
     'Drainage lymphatique et gestuelle légère, jambes et circulation.',
     'Un drainage lymphatique porté par une gestuelle légère, inspirée du mouvement des embruns : la circulation se relance, les jambes s’allègent.',
     'douce', 'Jambes lourdes, station debout prolongée, besoin de légèreté.',
     null,
     'Drainage lymphatique le long de la jambe, gestuelle légère et régulière, ambiance claire.', true, false, 3),
    ('shirochampi-iberique', 'Shirochampi Ibérique',
     'Massage crânien, nuque et épaules : une séance courte contre le stress mental.',
     'Un massage crânien associé à la nuque et aux épaules, pour relâcher les tensions mentales en une séance courte.',
     'douce', 'Stress mental, fin de journée chargée, pause courte.',
     null,
     'Massage crânien, mains posées de part et d’autre de la tête, pression lente et enveloppante.', false, false, 4),
    ('deep-relax', 'Deep Relax',
     'Une séance lente, pensée pour ralentir profondément.',
     'Une séance lente et apaisante pensée pour ralentir et favoriser une profonde sensation de détente.',
     'douce', 'Fatigue mentale, sommeil difficile, besoin de calme.',
     '/images/services/deep-relax.jpg',
     'Massage lent des épaules et du haut du dos, la personne allongée, visage détendu sur l’appui-tête.', true, false, 5),
    ('sport-recovery', 'Sport & Recovery',
     'Une séance plus dynamique, orientée récupération.',
     'Une séance plus dynamique destinée aux personnes qui souhaitent consacrer leur moment de bien-être à la récupération et au relâchement musculaire.',
     'dynamique', 'Après l’entraînement, jambes lourdes, reprise du sport.',
     '/images/services/sport-recovery-2.jpg',
     'Massage de récupération de l’arrière de la jambe, la personne allongée sur le ventre, serviette drapée.', true, false, 6),
    ('rituel-andalou-atlantique', 'Rituel Andalou-Atlantique',
     'Un voyage en trois temps : chaleur andalouse, drainage atlantique, shirochampi final.',
     'L’expérience premium ALMA, en trois temps : la chaleur andalouse pour commencer, le drainage atlantique pour relancer la circulation, un shirochampi pour clore la séance.',
     'douce', 'Occasion particulière, cadeau, moment long pour soi.',
     '/images/services/rituel-mediterraneen.jpg',
     'Fin de séance du rituel : mains posées sur les tempes, bougies et lanterne en arrière-plan.', false, true, 7)
  on conflict (slug) do nothing
  returning id, slug
)
insert into public.service_durations (service_id, minutes, price_cents, sort_order)
select i.id, d.minutes, d.price_cents, d.sort_order
from inserted i
join (values
  ('signature-mediterranee', 60, 9000, 1),
  ('signature-mediterranee', 90, 12500, 2),
  ('sevilla-calor', 60, 9500, 1),
  ('sevilla-calor', 90, 13000, 2),
  ('cote-atlantique', 60, 9000, 1),
  ('cote-atlantique', 90, 12500, 2),
  ('shirochampi-iberique', 30, 5500, 1),
  ('shirochampi-iberique', 45, 7500, 2),
  ('deep-relax', 60, 9000, 1),
  ('deep-relax', 90, 12500, 2),
  ('sport-recovery', 60, 10000, 1),
  ('sport-recovery', 90, 14000, 2),
  ('rituel-andalou-atlantique', 90, 15000, 1),
  ('rituel-andalou-atlantique', 120, 19500, 2)
) as d(slug, minutes, price_cents, sort_order) on d.slug = i.slug;

insert into public.reviews (author_name, rating, quote, service_label, is_published, is_sample) values
  ('Claire M.', 5, 'Un lieu calme et une écoute vraiment attentive. On ressort apaisé, sans se presser.', 'Signature Méditerranée', true, true),
  ('Thomas R.', 5, 'La pression a été ajustée exactement comme je le souhaitais. Rare et appréciable.', 'Sport & Recovery', true, true),
  ('Inès B.', 5, 'L’ambiance du studio fait la moitié du travail. On ralentit dès la porte franchie.', 'Rituel Andalou-Atlantique', true, true);
