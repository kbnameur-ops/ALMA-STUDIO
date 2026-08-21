import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { RevealLines } from '@/components/ui/Reveal';
import { ServiceCard } from '@/components/services/ServiceCard';
import type { Service } from '@/types';

/** Trois prestations mises en avant, sélectionnées en base (`is_signature`). */
export function SignaturesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section tone="ivory" spacing="lg" containerWidth="wide" aria-labelledby="signatures-titre">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Le studio</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.25rem]"
            lines={['Nos signatures']}
          />
        </div>
        <LinkButton href="/massages" variant="secondary" className="self-start sm:self-auto">
          Voir tous les massages
        </LinkButton>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    </Section>
  );
}
