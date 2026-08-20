import { cn } from '@/lib/utils/cn';
import type { Review } from '@/types';

function Stars({ rating }: { rating: number }) {
  return (
    <p className="flex items-center gap-0.5" aria-label={`Note : ${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          aria-hidden
          className={cn('h-3.5 w-3.5', index < rating ? 'fill-champagne' : 'fill-espresso/15')}
        >
          <path d="M10 1.6l2.4 5.1 5.6.7-4.1 3.9 1 5.6-4.9-2.7-4.9 2.7 1-5.6L2 7.4l5.6-.7z" />
        </svg>
      ))}
    </p>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-lg border border-[color:var(--color-line)] bg-ivory p-7">
      <div>
        <Stars rating={review.rating} />
        <blockquote className="mt-5 font-heading text-xl font-light leading-snug text-espresso text-pretty">
          « {review.quote} »
        </blockquote>
      </div>
      <figcaption className="mt-6 font-body text-xs uppercase tracking-[0.16em] text-espresso-55">
        {review.authorName}
        {review.serviceLabel && <span className="text-champagne"> · {review.serviceLabel}</span>}
      </figcaption>
    </figure>
  );
}
