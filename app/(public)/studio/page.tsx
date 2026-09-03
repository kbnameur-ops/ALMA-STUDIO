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
      <section className="relative flex min-h-[62svh] items-end overflow-hidden bg-ink-deep pt-28">
        <PlaceholderImage
          src="/images/studio/salle.jpg"
          alt="La salle du studio ALMA : table de massage dressée devant la baie, parquet et lumière basse."
          priority
          sizes="100vw"
          objectPosition="center 38%"
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 to-ink/25" />
        <Container width="wide" className="relative pb-16">
          <Eyebrow className="text-champagne">Le lieu</Eyebrow>
          <Heading level={1} size="xl" className="mt-4 max-w-2xl text-ivory">
            Un studio privé pensé pour ralentir.
          </Heading>
        </Container>
      </section>

      <Section tone="ink" spacing="lg" containerWidth="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Lead className="text-ivory-70">
              Lumière douce, matières naturelles, ambiance andalouse et atmosphère confidentielle.
              Le studio a été conçu comme une parenthèse : on y entre pour ralentir, on en ressort
              sans se presser.
            </Lead>
          </div>

          <dl className="space-y-10">
            {details.map((detail, index) => (
              <Reveal key={detail.title} delay={index * 0.07}>
                <dt className="font-heading text-2xl font-light">{detail.title}</dt>
                <dd className="mt-3 font-body text-sm leading-relaxed text-ivory-70">
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

      <Section tone="raised" spacing="lg" containerWidth="wide">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>Venir au studio</Eyebrow>
            <Heading size="lg" className="mt-4">
              Adresse &amp; accès
            </Heading>
            <address className="mt-6 not-italic font-body text-sm leading-relaxed text-ivory-70">
              {site.businessAddress.city}
            </address>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-55">
              {site.studioLocationNote} Le code d’accès suit la même voie.
            </p>
            <p className="mt-6 font-body text-sm text-ivory-70">{site.openingHoursLabel}</p>

            <div className="mt-8 border-t border-ivory/10 pt-6">
              <h2 className="font-body text-[0.68rem] uppercase tracking-[0.2em] text-champagne">
                Une question avant de réserver
              </h2>
              <p className="mt-3 font-body text-sm text-ivory-70">
                <a
                  href={`tel:${site.contactPhoneE164}`}
                  className="underline decoration-champagne underline-offset-4 transition-colors hover:text-ivory"
                >
                  {site.contactPhone}
                </a>
                {site.whatsapp.enabled && (
                  <>
                    {' · '}
                    <a
                      href={site.whatsapp.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-champagne underline-offset-4 transition-colors hover:text-ivory"
                    >
                      WhatsApp
                    </a>
                  </>
                )}
              </p>
            </div>

            <LinkButton href="/reservation" className="mt-8">
              Réserver une séance
            </LinkButton>
          </div>

          <div className="rounded-lg border border-ivory/10 bg-ink/70 p-8">
            <Heading size="sm">Massage à domicile</Heading>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
              Certaines expériences ALMA peuvent être proposées à domicile, selon votre adresse et
              nos disponibilités. Le studio reste la formule principale : c’est là que l’expérience
              est la plus complète.
            </p>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
              La zone est vérifiée automatiquement pendant la réservation, à partir de votre code
              postal ; les frais de déplacement s’affichent avant validation.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
