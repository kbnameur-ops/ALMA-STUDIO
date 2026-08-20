import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceCard } from '@/components/services/ServiceCard';
import type { Service } from '@/types';

/** Trois prestations mises en avant, sélectionnées en base (`is_signature`). */
export function SignaturesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section tone="ivory" spacing="lg" containerWidth="wide" aria-labelledby="signatures-titre">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Le studio</Eyebrow>
          <Heading id="signatures-titre" size="lg" className="mt-4">
            Nos signatures
          </Heading>
        </div>
        <LinkButton href="/massages" variant="secondary" className="self-start sm:self-auto">
          Voir tous les massages
        </LinkButton>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal key={service.id} delay={index * 0.08} className="h-full">
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
