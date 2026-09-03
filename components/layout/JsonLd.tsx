/**
 * Injecte un bloc JSON-LD.
 * Le contenu provient exclusivement de `lib/seo.ts` (données maîtrisées),
 * jamais d'une saisie utilisateur.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
