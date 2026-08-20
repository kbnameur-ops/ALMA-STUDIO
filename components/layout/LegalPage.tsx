import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading } from '@/components/ui/Heading';

/**
 * Gabarit des pages légales.
 *
 * Les informations d'entreprise inconnues restent des placeholders
 * `[MAJUSCULES]` : elles doivent être renseignées dans `config/site.ts`
 * avant mise en ligne, et ne sont jamais inventées.
 */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <Section tone="ivory" spacing="lg" className="pt-32 sm:pt-40" containerWidth="narrow">
      <Eyebrow>Informations légales</Eyebrow>
      <Heading level={1} size="lg" className="mt-4">
        {title}
      </Heading>
      <p className="mt-4 font-body text-xs text-espresso-55">Dernière mise à jour : {updatedAt}</p>

      <div className="mt-12 space-y-10 font-body text-sm leading-relaxed text-espresso-70 [&_h2]:font-body [&_h2]:text-[0.7rem] [&_h2]:uppercase [&_h2]:tracking-[0.2em] [&_h2]:text-champagne [&_h2+p]:mt-3 [&_h2+ul]:mt-3 [&_li]:mt-1 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </Section>
  );
}
