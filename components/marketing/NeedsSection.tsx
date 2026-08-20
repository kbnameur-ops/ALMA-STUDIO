import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';

const needs = [
  'Après une longue journée',
  'Après le sport',
  'Après des heures devant un écran',
  'Quand vous avez simplement besoin de ralentir',
];

export function NeedsSection() {
  return (
    <Section tone="sand" spacing="lg" aria-labelledby="besoins-titre">
      <div className="max-w-2xl">
        <Eyebrow>Pour qui</Eyebrow>
        <Heading id="besoins-titre" size="lg" className="mt-4">
          Pour ralentir. Pour récupérer. Pour respirer.
        </Heading>
      </div>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {needs.map((need, index) => (
          <Reveal as="li" key={need} delay={index * 0.06}>
            <div className="flex h-full flex-col justify-between rounded-lg border border-espresso/10 bg-ivory/70 p-6 transition-colors duration-300 hover:border-espresso/25">
              <span aria-hidden className="font-body text-xs tracking-[0.24em] text-champagne">
                0{index + 1}
              </span>
              <p className="mt-10 font-heading text-2xl font-light leading-snug text-espresso">
                {need}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>

      <p className="mt-10 font-body text-sm text-espresso-70">Nous nous adaptons à votre moment.</p>
    </Section>
  );
}
