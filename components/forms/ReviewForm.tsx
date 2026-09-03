'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/forms/Field';
import { cn } from '@/lib/utils/cn';

/**
 * Dépôt d'un avis après séance.
 * L'avis est relu par le studio avant publication : le formulaire l'annonce
 * explicitement plutôt que de laisser croire à une mise en ligne immédiate.
 */
export function ReviewForm({ reference }: { reference: string | null }) {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, quote, reference }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setError(
          typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Envoi impossible pour le moment.',
        );
        return;
      }
      setSent(true);
    } catch {
      setError('Envoi impossible pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <p
        role="status"
        className="rounded-lg border border-sage/30 bg-sage/6 p-6 font-body text-sm leading-relaxed text-sage"
      >
        Merci — votre message nous est bien parvenu. Il sera relu avant d’être éventuellement publié
        sur le site.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-body text-[0.7rem] uppercase tracking-[0.16em] text-ivory-70">
          Votre note
        </legend>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              aria-label={`${value} sur 5`}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-colors',
                value <= rating
                  ? 'border-champagne bg-champagne/15 text-champagne'
                  : 'border-[color:var(--color-line-strong)] text-ivory-55',
              )}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <Input
        label="Votre nom ou vos initiales"
        value={authorName}
        onChange={(event) => setAuthorName(event.target.value)}
        maxLength={80}
        hint="Seul ce que vous indiquez ici sera affiché."
        required
      />

      <Textarea
        label="Votre retour"
        value={quote}
        onChange={(event) => setQuote(event.target.value)}
        minLength={10}
        maxLength={600}
        rows={4}
        required
      />

      {error && (
        <p role="alert" className="font-body text-sm text-terracotta">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={() => void submit()}
        disabled={submitting || authorName.trim().length === 0 || quote.trim().length < 10}
      >
        {submitting ? 'Envoi…' : 'Envoyer mon avis'}
      </Button>
    </div>
  );
}
