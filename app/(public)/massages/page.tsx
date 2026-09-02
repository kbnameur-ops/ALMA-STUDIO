import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceCard } from '@/components/services/ServiceCard';
import { LinkButton } from '@/components/ui/Button';
import { JsonLd } from '@/components/layout/JsonLd';
import { getServices } from '@/lib/repositories/services';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Nos massages',
  description:
    'Sept expériences de bien-être au studio, entre Andalousie et Atlantique : Sevilla Calor, Côte Atlantique, Shirochampi Ibérique, deep relax, récupération sportive et rituel de 120 minutes. Durées, tarifs et réservation en ligne.',
  path: '/massages',
});

export const revalidate = 3600;

export default async function MassagesPage() {
  const services = await getServices();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Massages', path: '/massages' },
        ])}
      />

      <Section tone="raised" spacing="lg" className="pt-32 sm:pt-40" containerWidth="wide">
        <div className="max-w-3xl">
          <Eyebrow>Le catalogue</Eyebrow>
          <Heading level={1} size="xl" className="mt-4">
            Nos massages
          </Heading>
          <Lead className="mt-6 text-ivory-70">
            Chaque séance est adaptée à la personne : rythme, pression et zones travaillées sont
            ajustés après un court échange. Les durées et tarifs ci-dessous sont ceux pratiqués au
            studio.
          </Lead>
        </div>
      </Section>

      <Section tone="ink" spacing="lg" containerWidth="wide">
        {/* Titre de niveau 2 masqué : la grille de cartes utilise des `h3`,
            la hiérarchie du document resterait sinon discontinue. */}
        <h2 className="sr-only">Toutes les prestations</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={(index % 3) * 0.08} className="h-full">
              <ServiceCard service={service} variant="detailed" />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-8 sm:p-12">
          <Heading size="md">Une hésitation sur la séance à choisir ?</Heading>
          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-ivory-70">
            Choisissez la durée qui vous convient : le soin est ajusté sur place, après un court
            échange sur vos attentes du moment.
          </p>
          <LinkButton href="/reservation" className="mt-8">
            Réserver une séance
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
