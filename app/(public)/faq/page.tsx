import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { JsonLd } from '@/components/layout/JsonLd';
import { faqItems, type FaqItem } from '@/config/faq';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Questions fréquentes',
  description:
    'Réservation, annulation, déroulé d’une séance, massage à domicile, cartes cadeaux : les réponses aux questions les plus posées au studio.',
  path: '/faq',
});

/** Regroupe les questions par catégorie, dans l'ordre de déclaration. */
function groupByCategory(items: FaqItem[]): Array<[FaqItem['category'], FaqItem[]]> {
  const groups = new Map<FaqItem['category'], FaqItem[]>();
  for (const item of items) {
    const existing = groups.get(item.category);
    if (existing) existing.push(item);
    else groups.set(item.category, [item]);
  }
  return [...groups.entries()];
}

export default function FaqPage() {
  const groups = groupByCategory(faqItems);

  return (
    <>
      <JsonLd data={faqJsonLd(faqItems)} />

      <Section tone="raised" spacing="lg" className="pt-32 sm:pt-40" containerWidth="wide">
        <div className="max-w-3xl">
          <Eyebrow>Informations</Eyebrow>
          <Heading level={1} size="xl" className="mt-4">
            Questions fréquentes
          </Heading>
          <Lead className="mt-6 text-ivory-70">
            Tout ce qu’il est utile de savoir avant votre venue. Une question qui ne figure pas
            ici ? Écrivez-nous, nous répondons rapidement.
          </Lead>
        </div>
      </Section>

      <Section tone="ink" spacing="lg" containerWidth="default">
        <div className="space-y-16">
          {groups.map(([category, items]) => (
            <div key={category}>
              <h2 className="font-body text-[0.7rem] uppercase tracking-[0.22em] text-champagne">
                {category}
              </h2>
              <dl className="mt-6 divide-y divide-[color:var(--color-line)] border-t border-[color:var(--color-line)]">
                {items.map((item) => (
                  <details key={item.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-xl font-light">
                      {item.question}
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4 shrink-0 text-terracotta transition-transform duration-300 group-open:rotate-45"
                        aria-hidden
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      >
                        <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                      </svg>
                    </summary>
                    <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-ivory-70">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-8 sm:p-12">
          <Heading size="md">Prêt à réserver ?</Heading>
          <LinkButton href="/reservation" className="mt-6">
            Réserver une séance
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
