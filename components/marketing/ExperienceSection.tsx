import { Section } from '@/components/ui/Section';
import { Eyebrow, Lead } from '@/components/ui/Heading';
import { Reveal, RevealLines, RevealRule } from '@/components/ui/Reveal';

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
        <RevealLines
          as="h2"
          className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.5rem]"
          lines={[
            'Plus qu’un massage.',
            <em key="l2" className="font-normal italic text-terracotta">
              Un moment pour soi.
            </em>,
          ]}
        />
        <Lead className="mt-7 text-espresso-70">
          L’expérience ALMA commence dès l’arrivée. Lumière douce, matières naturelles, musique
          discrète et attention portée à chaque détail créent un espace où l’on peut enfin ralentir.
        </Lead>
      </div>

      <ol className="mt-20 grid gap-12 sm:grid-cols-3 sm:gap-10">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title} delay={index * 0.1} className="relative">
            {/* Filet vertical : rythme la colonne, rappelle le montant de l'arche. */}
            <span aria-hidden className="alma-stem absolute -top-6 left-0 h-14 w-px" />
            <span className="font-body text-xs tracking-[0.26em] text-champagne">0{index + 1}</span>
            <RevealRule className="mt-5" />
            <h3 className="mt-6 font-heading text-[1.75rem] font-light">{step.title}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-espresso-70">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
