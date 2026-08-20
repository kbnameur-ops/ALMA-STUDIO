import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal } from '@/components/ui/Reveal';

export function StudioSection() {
  return (
    <Section tone="sand" spacing="lg" containerWidth="wide" aria-labelledby="studio-titre">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <PlaceholderImage
            src={null}
            alt="Intérieur du studio ALMA : pierre, bois et lin"
            token="[PHOTO_STUDIO]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-4/5 w-full rounded-lg lg:aspect-3/4"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Le lieu</Eyebrow>
          <Heading id="studio-titre" size="lg" className="mt-4">
            Un studio privé pensé pour ralentir.
          </Heading>
          <Lead className="mt-6 text-espresso-70">
            Lumière douce, matières naturelles, ambiance méditerranéenne et atmosphère
            confidentielle.
          </Lead>
          <LinkButton href="/studio" variant="secondary" className="mt-8">
            Découvrir le studio
          </LinkButton>
        </Reveal>
      </div>
    </Section>
  );
}
