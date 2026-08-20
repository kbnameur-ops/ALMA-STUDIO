import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';

const steps = [
  {
    title: 'Écouter',
    text: 'Chaque séance commence par un court échange afin de comprendre les attentes et préférences du client.',
  },
  {
    title: 'Personnaliser',
    text: 'Le rythme, la pression et les zones travaillées sont adaptés à chaque personne.',
  },
  {
    title: 'Ralentir',
    text: 'La séance se termine progressivement pour prolonger naturellement la sensation de détente.',
  },
];

export function ExperienceSection() {
  return (
    <Section tone="ivory" spacing="lg" aria-labelledby="experience-titre">
      <div className="max-w-3xl">
        <Eyebrow>L’expérience</Eyebrow>
        <Heading id="experience-titre" size="lg" className="mt-4">
          Plus qu’un massage. Un moment pour soi.
        </Heading>
        <Lead className="mt-6 text-espresso-70">
          L’expérience ALMA commence dès l’arrivée. Lumière douce, matières naturelles, musique
          discrète et attention portée à chaque détail créent un espace où l’on peut enfin ralentir.
        </Lead>
      </div>

      <ol className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title} delay={index * 0.08}>
            <span className="font-body text-xs tracking-[0.24em] text-champagne">
              0{index + 1}
            </span>
            <span className="alma-rule mt-4" aria-hidden />
            <h3 className="mt-5 font-body text-sm uppercase tracking-[0.2em] text-espresso">
              {step.title}
            </h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-espresso-70">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
