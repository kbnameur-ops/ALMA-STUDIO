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
    ('rihab', 'Rihab — Le Rituel de l’Apaisement',
     'Un massage enveloppant inspiré des gestes ancestraux du hammam arabo-andalou.',
     'Rihab évoque l’espace, l’ampleur et l’ouverture. Un massage enveloppant inspiré des gestes ancestraux du hammam arabo-andalou : manœuvres lentes, pressions profondes et mouvements fluides s’enchaînent pour dénouer les tensions et calmer le mental. Un rituel pensé comme une parenthèse de lâcher-prise profond.' || E'\n\n' || 'Promesse : délier le corps, apaiser l’esprit, retrouver son souffle.',
     'douce', 'Besoin de lâcher-prise profond, fatigue mentale, envie de calme.',
     '/images/services/rituel-mediterraneen.jpg',
     'Fin de séance : mains posées sur les tempes, bougies et lanterne en arrière-plan.', true, true, 1),
    ('nour', 'Nour — Le Rituel du Réalignement',
     'Un massage énergétique inspiré des rituels de soin arabo-andalous, entre équilibre et ancrage.',
     'Nour signifie « lumière » en arabe. Un massage énergétique inspiré des rituels de soin arabo-andalous, associant gestes enveloppants, pressions ciblées et travail des lignes du corps. Le rituel accompagne la circulation et invite à retrouver une sensation d’équilibre, d’ancrage et d’harmonie intérieure.' || E'\n\n' || 'Promesse : rééquilibrer, réancrer, rayonner.',
     'moderee', 'Recherche d’équilibre, d’ancrage et d’harmonie intérieure.',
     '/images/services/signature-mediterranee.jpg',
     'Massage du dos à l’huile, mains à plat le long de la colonne, dans une lumière de bougies.', true, true, 2),
    ('andalus', 'Andalus — Le Rituel du Remodelage',
     'Un massage sculptant, entre remodelage, pressions glissées et travail des tissus.',
     'Un hommage direct à l’héritage andalou, à la rencontre des cultures et des savoir-faire. Un massage sculptant qui associe techniques de remodelage, pressions glissées et travail manuel des tissus et des fascias. L’objectif est de libérer les zones de tension, améliorer la mobilité tissulaire et redessiner progressivement les lignes du corps.' || E'\n\n' || 'Promesse : libérer les tissus, resculpter les lignes, révéler le mouvement.',
     'dynamique', 'Tensions musculaires, besoin de mobilité, envie de retrouver du mouvement.',
     '/images/services/sport-recovery-2.jpg',
     'Massage profond de l’arrière de la jambe, travail manuel des tissus, la personne allongée sur le ventre, serviette drapée.', true, true, 3)
  on conflict (slug) do nothing
  returning id, slug
)
insert into public.service_durations (service_id, minutes, price_cents, sort_order)
select i.id, d.minutes, d.price_cents, d.sort_order
from inserted i
join (values
  ('rihab', 60, 9500, 1),
  ('rihab', 90, 13000, 2),
  ('nour', 60, 9500, 1),
  ('nour', 90, 13000, 2),
  ('andalus', 60, 9500, 1),
  ('andalus', 90, 13000, 2)
) as d(slug, minutes, price_cents, sort_order) on d.slug = i.slug;

insert into public.reviews (author_name, rating, quote, service_label, is_published, is_sample) values
  ('Claire M.', 5, 'Un lieu calme et une écoute vraiment attentive. On ressort apaisé, sans se presser.', 'Rihab', true, true),
  ('Thomas R.', 5, 'La pression a été ajustée exactement comme je le souhaitais. Rare et appréciable.', 'Andalus', true, true),
  ('Inès B.', 5, 'L’ambiance du studio fait la moitié du travail. On ralentit dès la porte franchie.', 'Nour', true, true);
