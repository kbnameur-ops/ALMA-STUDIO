import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

const needs = [
  'Après une longue journée',
  'Après le sport',
  'Après des heures devant un écran',
  'Quand vous avez simplement besoin de ralentir',
];

export function NeedsSection() {
  return (
    <Section tone="espresso" spacing="lg" aria-labelledby="besoins-titre">
      <div className="max-w-2xl">
        <Eyebrow className="text-champagne">Pour qui</Eyebrow>
        <RevealLines
          as="h2"
          className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] text-ivory sm:text-[3.25rem]"
          lines={[
            'Pour ralentir.',
            'Pour récupérer.',
            <em key="l3" className="font-normal italic text-champagne">
              Pour respirer.
            </em>,
          ]}
        />
      </div>

      {/* Chaque besoin est une niche : arche basse, adossée au mur sombre. */}
      <ul className="mt-16 grid gap-px overflow-hidden border border-sand/12 sm:grid-cols-2 lg:grid-cols-4">
        {needs.map((need, index) => (
          <Reveal as="li" key={need} delay={index * 0.08}>
            <div className="group/need relative flex h-full min-h-52 flex-col justify-between bg-espresso p-7 outline outline-sand/12 transition-colors duration-700 ease-[var(--ease-alma)] hover:bg-shade">
              <span
                aria-hidden
                className="alma-arch-flat h-8 w-8 border border-sand/25 border-b-0 transition-colors duration-700 group-hover/need:border-champagne/60"
              />
              <p className="font-heading text-[1.6rem] font-light leading-snug text-ivory">{need}</p>
            </div>
          </Reveal>
        ))}
      </ul>

      <p className="mt-10 font-body text-sm text-sand/65">Nous nous adaptons à votre moment.</p>
    </Section>
  );
}
