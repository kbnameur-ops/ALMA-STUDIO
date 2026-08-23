import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal } from '@/components/ui/Reveal';
import { Arch } from '@/components/ui/Arch';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Le Studio',
  description:
    'Un studio privé à Paris pensé pour ralentir : lumière douce, matières naturelles et atmosphère confidentielle. Accès, ambiance et déroulé d’une visite.',
  path: '/studio',
});

const details = [
  {
    title: 'Un espace, une personne à la fois',
    text: 'Le studio n’accueille qu’un seul rendez-vous à la fois. Pas de salle d’attente, pas de va-et-vient : la séance vous appartient entièrement.',
  },
  {
    title: 'Matières et lumière',
    text: 'Pierre, bois, lin et terracotta. La lumière est tamisée, la musique discrète, la température ajustée avant chaque arrivée.',
  },
  {
    title: 'Le temps d’arriver',
    text: 'Présentez-vous quelques minutes avant l’heure : le temps de poser vos affaires et de commencer sans précipitation.',
  },
];

export default function StudioPage() {
  return (
    <>
      <section className="relative flex min-h-[62svh] items-end overflow-hidden bg-espresso pt-28">
        <PlaceholderImage
          src="/images/studio/salle.jpg"
          alt="La salle du studio ALMA : table de massage dressée devant la baie, parquet et lumière basse."
          priority
          sizes="100vw"
          objectPosition="center 38%"
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso/90 to-espresso/25" />
        <Container width="wide" className="relative pb-16">
          <Eyebrow className="text-champagne">Le lieu</Eyebrow>
          <Heading level={1} size="xl" className="mt-4 max-w-2xl text-ivory">
            Un studio privé pensé pour ralentir.
          </Heading>
        </Container>
      </section>

      <Section tone="ivory" spacing="lg" containerWidth="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Lead className="text-espresso-70">
              Lumière douce, matières naturelles, ambiance méditerranéenne et atmosphère
              confidentielle. Le studio a été conçu comme une parenthèse : on y entre pour ralentir,
              on en ressort sans se presser.
            </Lead>
          </div>

          <dl className="space-y-10">
            {details.map((detail, index) => (
              <Reveal key={detail.title} delay={index * 0.07}>
                <dt className="font-heading text-2xl font-light">{detail.title}</dt>
                <dd className="mt-3 font-body text-sm leading-relaxed text-espresso-70">
                  {detail.text}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <Arch className="relative aspect-4/3 w-full">
            <PlaceholderImage
              src="/images/studio/seance.jpg"
              alt="Une séance en cours au studio ALMA."
              sizes="(max-width: 640px) 100vw, 50vw"
              className="h-full w-full"
            />
          </Arch>
          <Arch delay={0.12} className="relative aspect-4/3 w-full">
            <PlaceholderImage
              src="/images/gestes/huile.jpg"
              alt="L’huile de massage versée dans le creux de la main, juste avant le premier geste."
              sizes="(max-width: 640px) 100vw, 50vw"
              className="h-full w-full"
            />
          </Arch>
        </div>
      </Section>

      <Section tone="sand" spacing="lg" containerWidth="wide">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Venir au studio</Eyebrow>
            <Heading size="lg" className="mt-4">
              Adresse &amp; accès
            </Heading>
            <address className="mt-6 not-italic font-body text-sm leading-relaxed text-espresso-70">
              {site.businessAddress.street}
              <br />
              {site.businessAddress.postalCode} {site.businessAddress.city}
              <br />
              <span className="text-espresso-55">[ACCES_TRANSPORTS]</span>
            </address>
            <p className="mt-6 font-body text-sm text-espresso-70">{site.openingHoursLabel}</p>
            <p className="mt-2 font-body text-xs text-espresso-55">
              L’adresse exacte et le code d’accès sont communiqués dans l’email de confirmation.
            </p>
            <LinkButton href="/reservation" className="mt-8">
              Réserver une séance
            </LinkButton>
          </div>

          <div className="rounded-lg border border-espresso/10 bg-ivory/70 p-8">
            <Heading size="sm">Massage à domicile</Heading>
            <p className="mt-4 font-body text-sm leading-relaxed text-espresso-70">
              Certaines expériences ALMA peuvent être proposées à domicile, selon votre adresse et
              nos disponibilités. Le studio reste la formule principale : c’est là que l’expérience
              est la plus complète.
            </p>
            <p className="mt-4 font-body text-sm leading-relaxed text-espresso-70">
              La zone est vérifiée automatiquement pendant la réservation, à partir de votre code
              postal ; les frais de déplacement s’affichent avant paiement.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
