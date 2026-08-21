import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { ReviewCard } from './ReviewCard';
import type { Review } from '@/types';

/**
 * Avis clients.
 *
 * Tant qu'aucun avis réel n'est publié, seuls des exemples de mise en page
 * s'affichent — et la section le dit, pour ne jamais faire passer une
 * donnée de démonstration pour un client.
 */
export function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const onlySamples = reviews.every((review) => review.isSample);

  return (
    <Section tone="ivory" spacing="lg" containerWidth="wide" aria-labelledby="avis-titre">
      <div className="max-w-2xl">
        <Eyebrow>Ils sont venus</Eyebrow>
        <RevealLines
          as="h2"
          className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.25rem]"
          lines={['Ce que l’on retient', <em key="l2" className="font-normal italic text-terracotta">d’une séance.</em>]}
        />
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <Reveal key={review.id} delay={index * 0.09} className="h-full">
            <ReviewCard review={review} />
          </Reveal>
        ))}
      </div>

      {onlySamples && (
        <p className="mt-10 font-body text-xs text-espresso-55">
          Exemples de mise en page — les avis affichés ici sont des données de démonstration, en
          attente des premiers retours clients.
        </p>
      )}
    </Section>
  );
}
