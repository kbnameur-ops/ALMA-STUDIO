import { Section } from '@/components/ui/Section';
import { Eyebrow, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { ArchMark } from '@/components/brand/ArchMark';

const options = ['60 min', '90 min', 'Rituel Méditerranéen', 'Montant libre'];

export function GiftCardSection() {
  return (
    <Section tone="sand" spacing="lg" containerWidth="wide" aria-labelledby="cadeau-titre">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>Carte cadeau</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.25rem]"
            lines={[
              'Offrez',
              <em key="l2" className="font-normal italic text-terracotta">
                une parenthèse.
              </em>,
            ]}
          />
          <Lead className="mt-7 text-espresso-70">
            Une carte cadeau ALMA, valable un an, envoyée par email au bénéficiaire avec votre
            message personnel.
          </Lead>
          <Reveal delay={0.15}>
            <LinkButton href="/carte-cadeau" className="mt-9">
              Offrir une carte cadeau
            </LinkButton>
          </Reveal>
        </div>

        {/* Chaque option est une niche : l'arche déclinée en petit format. */}
        <ul className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <Reveal as="li" key={option} delay={index * 0.07}>
              <div className="alma-arch-flat group/gift flex h-40 flex-col justify-end border border-espresso/12 bg-ivory/60 p-6 transition-colors duration-700 ease-[var(--ease-alma)] hover:border-terracotta/40 hover:bg-ivory">
                <ArchMark
                  size={22}
                  tone="mono-dark"
                  className="mb-auto text-champagne transition-colors duration-700 group-hover/gift:text-terracotta"
                />
                <span className="font-heading text-xl font-light leading-tight text-espresso">
                  {option}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
