import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { ReviewCard } from './ReviewCard';
import type { Review } from '@/types';

/**
 * Avis clients.
 *
 * Les avis sont gérés depuis le back-office. Tant qu'aucun avis réel n'est
 * publié, seuls des exemples de mise en page s'affichent — et la section
 * l'indique explicitement, pour ne jamais faire passer une donnée de
 * démonstration pour un client.
 */
export function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const onlySamples = reviews.every((review) => review.isSample);

  return (
    <Section tone="ivory" spacing="lg" containerWidth="wide" aria-labelledby="avis-titre">
      <div className="max-w-2xl">
        <Eyebrow>Ils sont venus</Eyebrow>
        <Heading id="avis-titre" size="lg" className="mt-4">
          Ce que l’on retient d’une séance.
        </Heading>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <Reveal key={review.id} delay={index * 0.07} className="h-full">
            <ReviewCard review={review} />
          </Reveal>
        ))}
      </div>

      {onlySamples && (
        <p className="mt-8 font-body text-xs text-espresso-55">
          Exemples de mise en page — les avis affichés ici sont des données de démonstration, en
          attente des premiers retours clients.
        </p>
      )}
    </Section>
  );
}
