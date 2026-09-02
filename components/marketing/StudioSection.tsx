import { Eyebrow } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * Le studio, en pleine largeur.
 *
 * L'image tenait dans une arche à côté d'une colonne de texte : à cette
 * échelle on ne voyait pas la pièce, on voyait une vignette de la pièce.
 * Ici elle occupe toute la largeur de l'écran et le texte se pose dessus.
 *
 * C'est le seul moment de la page où le contenu sort de la grille : après
 * l'index des signatures et avant le portrait, il faut une respiration
 * qui prenne toute la fenêtre, sans quoi la page redevient une pile de
 * sections de même largeur.
 */
export function StudioSection() {
  return (
    <section
      aria-labelledby="studio-titre"
      className="relative flex min-h-[80svh] items-end overflow-hidden bg-ink"
    >
      <PlaceholderImage
        src="/images/studio/salle.jpg"
        alt="La salle du studio ALMA avant une séance : table dressée, lumière basse, bambou près de la baie."
        sizes="100vw"
        objectPosition="center 42%"
        imageClassName="brightness-[0.62] saturate-[0.85]"
        className="absolute inset-0 h-full w-full"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-ink/80 to-transparent lg:w-1/2"
      />

      <Container width="wide" className="relative py-24 sm:py-32">
        <div className="max-w-xl">
          <Eyebrow className="text-champagne">Le lieu</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.75rem] leading-[1] text-ivory sm:text-[4rem]"
            lines={[
              'Un studio privé',
              <em key="l2" className="italic text-champagne">
                pensé pour ralentir.
              </em>,
            ]}
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md font-body text-[0.95rem] leading-relaxed text-ivory-70">
              Lumière douce, matières naturelles, entre chaleur andalouse et fraîcheur atlantique, atmosphère
              confidentielle. Un seul rendez-vous à la fois.
            </p>
            <LinkButton href="/studio" variant="outlineLight" className="mt-10">
              Découvrir le studio
            </LinkButton>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
