import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

const needs = [
  'Après une longue journée',
  'Après le sport',
  'Après des heures devant un écran',
  'Quand vous avez simplement besoin de ralentir',
];

/**
 * Les moments où l'on vient.
 *
 * Quatre cases bordées faisaient une grille de plus, et donnaient à quatre
 * phrases courtes le poids visuel de quatre rubriques. Elles se lisent
 * maintenant comme une liste posée en regard du titre : le trait qui les
 * sépare suffit à les distinguer, et le titre garde le premier rôle.
 */
export function NeedsSection() {
  return (
    <Section tone="deep" spacing="lg" containerWidth="wide" aria-labelledby="besoins-titre">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24">
        <div>
          <Eyebrow className="text-champagne">Pour qui</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.75rem] leading-[1] text-ivory sm:text-[4rem]"
            lines={[
              'Pour ralentir.',
              'Pour récupérer.',
              <em key="l3" className="italic text-champagne">
                Pour respirer.
              </em>,
            ]}
          />
        </div>

        <ul className="lg:pt-4">
          {needs.map((need, index) => (
            <Reveal as="li" key={need} delay={index * 0.08}>
              <div className="group/need flex items-baseline gap-6 border-t border-line py-6 last:border-b">
                <span className="font-body text-[0.6rem] tracking-[0.24em] text-champagne">
                  0{index + 1}
                </span>
                <p className="font-heading text-[1.5rem] leading-snug text-ivory transition-transform duration-700 ease-[var(--ease-alma)] group-hover/need:translate-x-1.5 sm:text-[1.75rem]">
                  {need}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 font-body text-sm text-ivory-55 lg:col-start-2">
          Nous nous adaptons à votre moment.
        </p>
      </div>
    </Section>
  );
}
