import { Section } from '@/components/ui/Section';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * Le manifeste : une plaque de texte seul, sans image ni bouton.
 *
 * La page enchaînait photo sur photo, section après section, sans jamais
 * respirer. Ce palier ne dit presque rien et n'affiche presque rien —
 * c'est sa fonction. Il sépare le hero du catalogue, laisse retomber
 * l'œil, et donne à la marque un endroit où parler à la première
 * personne plutôt que de vendre.
 *
 * Aucun visuel n'y est admis, jamais : ce serait rendre la page à son
 * défilement uniforme.
 */
export function ManifestoSection() {
  return (
    <Section
      tone="ink"
      spacing="lg"
      containerWidth="default"
      className="py-32 sm:py-44 lg:py-56"
      aria-labelledby="manifeste-titre"
    >
      <div className="mx-auto max-w-3xl text-center">
        {/* Le manifeste est composé en paragraphe, pas en titre : sa
            taille est de l'affichage, pas de la hiérarchie. Un titre
            invisible tient donc le plan du document. */}
        <h2 id="manifeste-titre" className="sr-only">
          Notre parti pris
        </h2>

        <span aria-hidden className="alma-rule mx-auto" />

        <RevealLines
          as="p"
          className="mt-14 font-heading text-[1.9rem] leading-[1.28] text-ivory sm:text-[2.6rem] lg:text-[3rem]"
          lines={[
            'Une heure où personne',
            'ne vous demande rien.',
            <em key="l3" className="italic text-champagne">
              C’est tout le programme.
            </em>,
          ]}
        />

        <Reveal delay={0.35}>
          <p className="mx-auto mt-12 max-w-xl font-body text-[0.95rem] leading-relaxed text-ivory-70">
            Un seul rendez-vous à la fois, dans un studio privé du 10<sup>e</sup>. Pas de salle
            d’attente, pas de musique de fond imposée, pas de vente de produits à la sortie.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
