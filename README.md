# ALHAMBRA STUDIO

Site de réservation d'un studio privé de massage à Paris.

> **Nom, baseline, logo, palette et typographies** vivent dans
> `config/brand.ts` ; les réglages fonctionnels dans `config/site.ts`. Les
> modifier suffit à renommer et rehabiller le site, emails et images de
> partage compris — le nom a déjà changé une fois (ALMA STUDIO → Alhambra
> Studio), c'est le chemin que ça emprunte.

---

## Sommaire

- [Démarrer](#démarrer)
- [Architecture](#architecture)
- [Modèle de données](#modèle-de-données)
- [Parcours de réservation](#parcours-de-réservation)
- [Configuration](#configuration)
- [Contenu à fournir](#contenu-à-fournir)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev
```

**Sans Supabase configuré, le site démarre quand même** : le catalogue provient
de `config/seed.ts`, clairement identifié comme jeu de démonstration. Les
disponibilités s'affichent, mais la réservation renvoie une erreur explicite
plutôt qu'un faux succès.

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run typecheck` | TypeScript strict, sans émission |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (Vitest) |

### Base de données

Dans l'éditeur SQL Supabase, exécuter dans l'ordre :

```
supabase/migrations/0001_init.sql          -- tables, index, contraintes
supabase/migrations/0002_rls.sql           -- politiques d'accès
supabase/migrations/0003_booking_functions.sql -- transactions métier
supabase/seed.sql                          -- données de lancement
```

Créer ensuite un compte dans **Authentication**, puis l'autoriser :

```sql
insert into public.admin_users (id, email, role)
values ('<uuid-du-compte>', 'vous@exemple.fr', 'owner');
```

Un compte authentifié absent de cette table n'a **aucun** accès au back-office.

### Webhook Stripe en local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Reporter le secret affiché dans `STRIPE_WEBHOOK_SECRET`. Sans lui, aucun
paiement n'est jamais confirmé — c'est voulu.

---

## Architecture

```
app/
  (public)/            pages publiques (Server Components)
  (admin)/admin/       back-office protégé
  (admin-auth)/        page de connexion, hors gabarit protégé
  api/                 route handlers (disponibilités, réservation, webhooks, cron)
components/
  ui/ layout/ forms/   design system
  booking/             tunnel de réservation
  services/ marketing/ catalogue et sections éditoriales
  admin/               tableaux, formulaires et actions du back-office
lib/
  booking/             moteur de disponibilité et calcul de prix (purs)
  repositories/        accès aux données — seul endroit qui parle SQL
  notifications/       emails (Resend) et SMS (abstraction Twilio)
  stripe/ supabase/    clients tiers, séparés serveur / navigateur
  validation/          schémas Zod partagés client/serveur
  analytics/           abstraction Plausible / GA
config/                marque, site, navigation, FAQ, données de démonstration
supabase/migrations/   schéma versionné
types/                 types métier et typage de la base
tests/                 tests unitaires des parties critiques
```

**Règle structurante :** aucune logique métier dans un composant, aucun SQL
hors de `lib/repositories`. Le moteur de disponibilité et le calcul de prix
sont des modules purs, sans I/O — c'est ce qui les rend testables.

---

## Modèle de données

17 tables : `customers`, `services`, `service_durations`, `locations`,
`business_hours`, `blocked_slots`, `bookings`, `booking_items`, `payments`,
`gift_cards`, `gift_card_transactions`, `promotions`, `reviews`,
`notifications`, `consents`, `settings`, `admin_users`.

Trois points méritent l'attention :

**Anti-double-réservation.** `bookings` porte une contrainte d'exclusion
PostgreSQL sur `tstzrange(blocks_from, blocks_until)`. Deux réservations
simultanées sur le même créneau ne peuvent pas coexister : la seconde est
rejetée par la base, pas par du code applicatif. `blocks_*` inclut préparation,
battement et, à domicile, le trajet aller-retour.

**Retenue de créneau.** Une réservation naît `pending` avec un
`hold_expires_at`. Si le paiement n'aboutit pas — ou si le studio ne répond
pas à une demande — la retenue est purgée (à la réservation suivante, et par
la tâche `/api/cron/cleanup`). Confirmer efface `hold_expires_at` : sans
quoi la purge, qui ne regarde que ce champ, libérerait un créneau confirmé.

**Prix recalculés en base.** `create_booking_atomic` relit
`service_durations.price_cents` et `locations.travel_fee_cents` : le montant
envoyé par le navigateur n'est jamais repris.

---

## Parcours de réservation

Deux parcours coexistent, réglés par `site.onlinePaymentEnabled`. **Le mode
actif est la demande** : rien n'est encaissé en ligne.

### Demande de réservation (`onlinePaymentEnabled: false`)

```
1 prestation → 2 durée → 3 lieu → 4 créneau → 5 informations
           → 6 demande → 7 accusé de réception
```

1. Étapes 1 à 5 identiques : mêmes disponibilités serveur, mêmes prix
   recalculés en base. Le client sait ce qu'il devra régler.
2. À l'étape 6, aucun `PaymentIntent`. La réservation est créée `pending`
   avec une retenue de `site.requestHoldHours` heures — les quinze minutes du
   parcours payant laisseraient le créneau repartir avant que le studio ait
   ouvert sa boîte mail.
3. Deux emails partent : la demande au studio (`contactEmail`) **d'abord**,
   puis l'accusé de réception au client. Cet ordre est délibéré : un échec
   d'envoi au client ne doit pas faire disparaître la demande.
4. Le studio confirme depuis `/admin/reservations`. La confirmation seule
   passe la réservation en `confirmed`, annule la retenue, consomme les
   codes et déclenche l'email de confirmation.
5. Passé le délai sans réponse, la retenue est purgée et le créneau libéré.
   Une demande sans réponse ne bloque pas l'agenda indéfiniment.
6. Le règlement se fait sur place.

**Rien dans ce parcours n'appelle une demande une réservation.** L'écran, les
emails, le statut affiché et les CGV disent tous la même chose : le créneau
est retenu, la réservation n'est acquise qu'après réponse du studio. Les
cartes cadeaux, elles, restent payées en ligne par Stripe.

### Réservation payée en ligne (`onlinePaymentEnabled: true`)

```
1 prestation → 2 durée → 3 lieu → 4 créneau → 5 informations
           → 6 paiement → 7 confirmation
```

Ce qui garantit qu'une réservation fonctionne réellement de bout en bout :

1. Les créneaux viennent de `/api/availability`, calculés côté serveur à partir
   des horaires, congés, réservations existantes, durée, préparation, battement
   et trajet. **Un créneau pris n'apparaît jamais.**
2. Avant création, le serveur revérifie que le créneau est proposable.
3. `create_booking_atomic` crée client, réservation et lignes en une
   transaction, et retient le créneau.
4. Un `PaymentIntent` Stripe est créé pour le montant recalculé.
5. **Le webhook Stripe signé est la seule source de vérité** : la réservation
   ne passe `confirmed` que là. La page de confirmation affiche « en cours de
   validation » tant que le webhook n'a rien dit — elle ne conclut jamais au
   succès sur la foi d'une redirection.
6. Codes promo et cartes cadeaux ne sont consommés qu'après encaissement.
7. L'email de confirmation part alors, une seule fois (index unique sur
   `notifications`, ce qui rend les rejeux Stripe inoffensifs).

Une séance intégralement couverte par une carte cadeau saute l'étape Stripe et
est confirmée immédiatement, côté serveur.

---

## Configuration

| Où | Quoi |
| --- | --- |
| `config/brand.ts` | Nom, baseline, logo, palette, typographies |
| `config/site.ts` | URL, fuseau, devise, coordonnées, mentions légales, coupe-circuits |
| `config/navigation.ts` | Menus header, footer, barre mobile |
| `config/faq.ts` | Questions fréquentes (page + JSON-LD) |
| Table `settings` | Délais d'annulation, rappels, battements, horizon, retenue |

Les valeurs de la table `settings` priment sur les défauts du code : le studio
ajuste sa politique d'annulation ou ses battements sans redéploiement.

**Aucun tarif n'existe dans le code.** Ils vivent dans `service_durations` et se
modifient depuis `/admin/prestations`.

---

## Direction artistique

**Nocturne, andalouse.** Le site est sombre de bout en bout. Les photos du
studio sont toutes en lumière basse : sur le fond sable de la première
version elles formaient des taches brunes, ici elles émergent de l'ombre
comme la pièce elle-même. L'encre n'est jamais un noir pur — un noir absolu
à l'écran est un trou, pas une matière ; elle tire vers le bleu nuit, la
couleur d'un ciel andalou après le coucher du soleil et des céramiques bleu
de cobalt du zellige.

Trois profondeurs seulement (`ink`, `ink-raised`, `ink-deep`), un accent
unique (`champagne`, la dorure), un accent d'action (`terracotta` — en
réalité un or plus dense que le champagne, pour que les boutons se
distinguent des libellés ; le nom du jeton CSS a gardé son historique — une
première itération l'avait fait passer par une aubergine avant que ce
rose ne soit écarté au profit de l'or — pour ne pas casser les ~40 fichiers
qui l'utilisent). Les écarts entre les trois fonds sont volontairement
infimes : sur fond sombre, deux points de clarté suffisent à séparer deux
plans, un contraste franc ferait des bandes.

**Le motif.** Une mosaïque géométrique inspirée du zellige et des tomettes
de l'Alhambra, tissée en toile de fond sur tout le site via `.alma-zellige`
(`styles/globals.css`, appliquée sur `<body>` à côté de `.alma-grain`) —
le même geste que le grain, un seul calque de composition fixe plutôt qu'un
motif répété section par section. Un pavage continu d'octogones (des
carrés aux coins chanfreinés) dont les diagonales internes dessinent
l'étoile à huit branches classique du motif : contrairement à une étoile
isolée, essayée d'abord, le pavage ne laisse aucun vide entre les formes.
Le `mix-blend-mode: overlay` du grain s'est révélé inadapté ici : sa formule
assombrit tout blend sur un fond aussi sombre que l'encre, le motif restait
invisible même à forte opacité. Une opacité directe (`0.09`), sans mode de
fusion, donne un résultat prévisible et lisible quel que soit le fond.

**Instrument Serif** en titrage, **Instrument Sans** en labeur. Cormorant,
qui tenait le titrage, s'effaçait sur fond sombre : ses déliés
disparaissaient en ivoire sur l'encre.

**Le rythme est la matière première.** La page d'accueil alternait quatre
grilles de trois colonnes : on descendait sans jamais changer de tempo.
Elle enchaîne désormais fond perdu → plaque de texte seul → index
éditorial avec panneau d'aperçu → arches décalées → liste asymétrique →
bandeau pleine largeur → portrait asymétrique → citation unique → bandeau
de fin. Aucune section ne répète la précédente.

**Contraste vérifié, pas estimé.** Les couleurs de texte sont mesurées en
peignant chaque couleur calculée sur son fond réel, alpha comprise — lire
la valeur CSS à la main donne des résultats faux dès qu'une couleur est
exprimée en `oklab`. Le jeton de texte discret est à 0,55 d'opacité et non
0,44 pour cette seule raison : à 0,44 il tombait à 3,9:1, sous le seuil AA
du petit texte. Les boutons dorés portent un texte encre, pas
ivoire : l'ivoire n'y donnait que 2,1:1.

---

## Contenu à fournir

Les informations non communiquées sont des placeholders explicites, jamais
inventées. Rechercher `[` dans `config/site.ts` et les composants :

- **Photos** — le catalogue compte 3 prestations (Rihab, Nour, Andalus),
  toutes illustrées en réutilisant des visuels déjà livrés
  (`public/images/services/<fichier>.jpg`, référencés par `image_url`) :
  aucun visuel neuf n'a été fourni pour ce repositionnement. Le hero et la
  salle (`public/images/studio/`), le portrait du praticien
  (`public/images/equipe/`), les quatre gestes (`public/images/gestes/` :
  section Expérience de l'accueil et détail de la page Studio) restent
  inchangés. Quand le cadre et la photo n'ont pas le même format, piloter le
  recadrage avec `objectPosition` plutôt que de laisser le centre géométrique
  couper un visage.
  Le portrait actuel (`equipe/praticien-3.jpg`, 750 × 1334 px) est un
  traitement de la photo fournie par le studio : désaturation et teinte
  chaude pour retirer le ciel à bandes multicolores de l'original
  (`equipe/praticien-2.jpg`, conservé sur le disque mais inutilisé), qui
  détonnait avec la palette nocturne du reste du site.
- **Marques tierces** — `gestes/huile.jpg` est recadré en dur depuis la photo
  source, dont le flacon portait la marque d'un autre spa. Ne jamais republier
  la source non recadrée, et vérifier ce point sur tout nouveau visuel où une
  étiquette, une enseigne ou un logo est lisible.
- **Remplacer une photo** — ne jamais réécrire un fichier à son chemin actuel :
  l'optimiseur d'images met en cache sur la clé de l'URL, et l'ancienne version
  continue d'être servie (localement comme sur le CDN). Publier sous un nom
  versionné (`espagnol-evasion-3.jpg`) et mettre à jour `image_url`.
- **Logo** — le monogramme fourni par le studio (`public/logo/alhambra-mark.png`,
  référencé par `brand.logo.mark`) est une image détaillée (mandala, mains,
  silhouette gravés), pas un tracé vectoriel recolorable comme l'ancien
  monogramme abstrait (`components/brand/ArchMark.tsx`, conservé pour les
  usages purement décoratifs — hero, section « Un même héritage » — où une
  forme simple et recolorable reste préférable). Fond découpé par seuillage
  de luminosité depuis l'export fourni (fond blanc), pas de version
  vectorielle source. Le logotype (« ALHAMBRA » / « STUDIO ») reste du texte
  vivant à côté de l'image, jamais intégré dedans — le texte gravé dans
  l'image fournie est en encre foncée, illisible sur le fond sombre du site.
- **Praticien** — nom et formation renseignés dans `config/site.ts`
  (`site.practitioner`). La formation est transcrite telle que communiquée
  par le studio : deux écoles, leurs disciplines, rien d'autre. La
  biographie est rédigée à partir des éléments de carrière communiqués.
  **Aucun diplôme, aucune certification et aucune durée d'expérience n'ont
  été inventés** — le titre de la rubrique est
  « Formation » et non « Formation & expérience », faute de durée
  d'exercice communiquée.
- **Contact** — email, téléphone et WhatsApp renseignés (téléphone et
  WhatsApp sur la même ligne : `contactPhone` / `contactPhoneE164` /
  `whatsapp.url`).
- **Adresse du studio — volontairement absente.** Le lieu exact dépend du
  créneau et de la disponibilité du praticien : il n'existe donc pas
  d'adresse fixe à afficher, et `businessAddress` ne porte plus que la
  ville (`city: 'Paris'`). Partout où une adresse serait attendue —
  page Studio, tunnel de réservation, emails — `site.studioLocationNote`
  rappelle qu'elle est communiquée directement par le studio. Le JSON-LD
  `HealthAndBeautyBusiness` suit la même règle : `areaServed` porte la
  zone couverte, sans `PostalAddress` complète ni coordonnées GPS. Le
  siège social légal (mentions légales) est une notion distincte, gérée à
  part sous `site.legal.address` — à ne jamais déduire du lieu des
  séances.
- **Réseaux sociaux** — aucun compte pour le moment : le bloc a été retiré
  du pied de page plutôt que laissé en placeholder. Le rétablir demandera
  de rouvrir un `social` dans `config/site.ts`.
- **Légal** — `[RAISON_SOCIALE]`, `[SIRET]`, `[ADRESSE_SIEGE_SOCIAL]`,
  `[HEBERGEUR]`, `[MEDIATEUR_CONSOMMATION]`, etc.
- **Avis** — les trois avis livrés sont marqués `is_sample` et la page le dit
  explicitement. À dépublier depuis `/admin/avis` dès les premiers vrais avis.

---

## Sécurité

- **RLS activé sur toutes les tables.** Le public lit le catalogue et les avis
  publiés ; il n'écrit jamais directement. Les écritures passent par le serveur
  avec la clé de service, jamais exposée au navigateur.
- **Double barrière sur `/admin`** : middleware (session) puis vérification
  serveur de l'appartenance à `admin_users`. Chaque Server Action revérifie la
  session — une action est un point d'entrée HTTP à part entière.
- **Webhooks signés** : signature invalide → 400, sans traitement.
- **Limitation de débit** sur réservation, vérification de code, zone, avis et
  achat de carte cadeau. En mémoire par instance : à doubler d'un compteur
  partagé (Vercel KV, Upstash) sur une infrastructure multi-instances.
- **Validation systématique côté serveur** (Zod), la validation navigateur
  n'étant qu'un confort.
- **Vérification de code** : message unique en cas d'échec, pour ne pas révéler
  qu'un code existe mais est expiré.
- **RGPD** : consentements tracés séparément (conditions / marketing), aucune
  information médicale collectée, aucun traceur avant acceptation explicite.

---

## Tests

```bash
npm test
```

72 tests couvrant les parties où une erreur coûte cher :

- moteur de disponibilité — plages d'ouverture, jours fermés, créneaux occupés,
  préparation, battement, trajet, délai de prévenance ;
- **fuseau horaire** — CET/CEST, énumération de dates franchissant le
  changement d'heure ;
- calcul de prix — pourcentages, montants fixes, plafonds, cumul carte cadeau,
  jamais de total négatif ;
- politique d'annulation, avec seuil configurable ;
- machine à états du tunnel — invalidations en cascade ;
- modèles d'emails, dont l'échappement du contenu variable ;
- génération de codes et schémas de validation.

Le webhook Stripe et la transaction de réservation reposent sur des garanties
PostgreSQL (contrainte d'exclusion, fonctions idempotentes) : ils se vérifient
contre une vraie base, avec `stripe listen` et `supabase start`.

---

## Déploiement

**Vercel.** Renseigner les variables de `.env.example` dans le projet, puis
déclarer le webhook Stripe sur `https://<domaine>/api/stripe/webhook`
(événements `payment_intent.succeeded`, `payment_intent.payment_failed`,
`charge.refunded`).

`vercel.json` planifie deux tâches, protégées par `CRON_SECRET` :

| Tâche | Fréquence | Rôle |
| --- | --- | --- |
| `/api/cron/reminders` | horaire | Rappel avant séance (délai configurable) |
| `/api/cron/cleanup` | toutes les 30 min | Purge des retenues, péremption des cartes |

Avant mise en ligne : remplacer les placeholders `[…]`, charger les photos,
dépublier les avis d'exemple, vérifier les horaires dans `/admin/planning`, et
passer une réservation de bout en bout en mode test Stripe.
