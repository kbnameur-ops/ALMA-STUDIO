import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Arch } from '@/components/ui/Arch';
import { imageFocus } from '@/config/imageFocus';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceBadge } from '@/components/services/ServiceBadge';
import { JsonLd } from '@/components/layout/JsonLd';
import { getServiceBySlug, getServices } from '@/lib/repositories/services';
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo';
import { formatDuration } from '@/lib/utils/format';

export const revalidate = 3600;

/** Pré-génère une page par prestation active du catalogue. */
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return pageMetadata({ title: 'Massage', description: '', path: `/massages/${slug}` });

  const durations = service.durations.map((duration) => `${duration.minutes} min`).join(' ou ');
  return pageMetadata({
    title: service.name,
    description: `${service.shortDescription} Séance de ${durations} au studio, à Paris, sur rendez-vous.`,
    path: `/massages/${service.slug}`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const allServices = await getServices();
  const others = allServices.filter((item) => item.id !== service.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.description,
          slug: service.slug,
          offers: service.durations.map((duration) => ({
            minutes: duration.minutes,
            priceCents: duration.priceCents,
          })),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Massages', path: '/massages' },
          { name: service.name, path: `/massages/${service.slug}` },
        ])}
      />

      <section className="bg-sand pt-28 sm:pt-32">
        <Container width="wide" className="py-12 sm:py-16">
          <nav aria-label="Fil d’Ariane" className="font-body text-xs text-espresso-55">
            <Link href="/massages" className="transition-colors hover:text-espresso">
              Massages
            </Link>
            <span aria-hidden> · </span>
            <span aria-current="page">{service.name}</span>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div>
              <Eyebrow>Prestation</Eyebrow>
              <Heading level={1} size="xl" className="mt-4">
                {service.name}
              </Heading>
              <Lead className="mt-6 text-espresso-70">{service.description}</Lead>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ServiceBadge intensity={service.intensity} />
                {service.homeServiceAvailable && (
                  <span className="font-body text-xs text-espresso-55">
                    Également possible à domicile, selon adresse et disponibilités
                  </span>
                )}
              </div>
            </div>

            <Arch className="relative aspect-4/5 w-full lg:aspect-3/4">
              <PlaceholderImage
                src={service.imageUrl}
                alt={service.imageAlt}
                token={`[PHOTO_${service.slug.toUpperCase().replace(/-/g, '_')}]`}
                sizes="(max-width: 1024px) 100vw, 45vw"
                objectPosition={imageFocus(service.imageUrl)}
                className="h-full w-full"
              />
            </Arch>
          </div>
        </Container>
      </section>

      <Section tone="ivory" spacing="md" containerWidth="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-20">
          <div>
            <Heading size="md">Durées &amp; tarifs</Heading>
            <dl className="mt-8 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
              {service.durations.map((duration) => (
                <div key={duration.id} className="flex items-center justify-between gap-6 py-5">
                  <dt className="font-heading text-2xl font-light">
                    {formatDuration(duration.minutes)}
                  </dt>
                  <dd className="flex items-center gap-5">
                    <Price cents={duration.priceCents} className="text-lg" />
                    <LinkButton
                      href={`/reservation?service=${service.slug}&duree=${duration.minutes}`}
                      size="sm"
                    >
                      Réserver
                      <span className="sr-only"> — {formatDuration(duration.minutes)}</span>
                    </LinkButton>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="rounded-lg border border-[color:var(--color-line)] bg-sand-50 p-7">
            <h2 className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
              Pour qui
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-espresso-70">
              {service.recommendedFor}
            </p>

            <h2 className="mt-8 font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
              Le déroulé
            </h2>
            <ol className="mt-3 space-y-2 font-body text-sm leading-relaxed text-espresso-70">
              <li>Accueil et court échange sur vos attentes.</li>
              <li>Séance ajustée en rythme et en pression.</li>
              <li>Retour progressif, puis un moment pour repartir sans se presser.</li>
            </ol>

            <p className="mt-8 font-body text-xs leading-relaxed text-espresso-55">
              Prestation de bien-être et de relaxation. Elle ne constitue ni un acte médical ni un
              soin thérapeutique.
            </p>
          </aside>
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="sand" spacing="lg" containerWidth="wide">
          <Heading size="md">Autres expériences</Heading>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other, index) => (
              <Reveal key={other.id} delay={index * 0.07} className="h-full">
                <ServiceCard service={other} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
