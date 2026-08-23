import { Section } from '@/components/ui/Section';
import { Eyebrow, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Arch } from '@/components/ui/Arch';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

export function StudioSection() {
  return (
    <Section tone="sand" spacing="lg" containerWidth="wide" aria-labelledby="studio-titre">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-24">
        {/* Le visuel du studio est une ouverture : on regarde à l'intérieur. */}
        <Arch className="relative aspect-4/3 w-full">
          <PlaceholderImage
            src="/images/studio/salle.jpg"
            alt="La salle du studio ALMA avant une séance : table dressée, lumière basse, bambou près de la baie."
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="h-full w-full"
          />
        </Arch>

        <div>
          <Eyebrow>Le lieu</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.25rem]"
            lines={[
              'Un studio privé',
              <em key="l2" className="font-normal italic text-terracotta">
                pensé pour ralentir.
              </em>,
            ]}
          />
          <Lead className="mt-7 text-espresso-70">
            Lumière douce, matières naturelles, ambiance méditerranéenne et atmosphère
            confidentielle.
          </Lead>
          <Reveal delay={0.15}>
            <LinkButton href="/studio" variant="secondary" className="mt-9">
              Découvrir le studio
            </LinkButton>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
