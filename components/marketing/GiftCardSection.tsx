import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

const options = ['60 min', '90 min', 'Rituel Méditerranéen', 'Montant libre'];

export function GiftCardSection() {
  return (
    <Section tone="espresso" spacing="lg" containerWidth="wide" aria-labelledby="cadeau-titre">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow className="text-champagne">Carte cadeau</Eyebrow>
          <Heading id="cadeau-titre" size="lg" className="mt-4 text-ivory">
            Offrez une parenthèse.
          </Heading>
          <Lead className="mt-6 text-sand/75">
            Une carte cadeau ALMA, valable un an, envoyée par email au bénéficiaire avec votre
            message personnel.
          </Lead>
          <LinkButton href="/carte-cadeau" variant="light" className="mt-8">
            Offrir une carte cadeau
          </LinkButton>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <li
                key={option}
                className="flex min-h-24 items-end rounded-lg border border-sand/15 bg-sand/5 p-5 font-heading text-xl font-light text-ivory"
              >
                {option}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
