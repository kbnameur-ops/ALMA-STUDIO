import 'server-only';

/**
 * Limitation de débit en mémoire.
 *
 * Suffisant pour freiner les abus évidents sur les endpoints sensibles
 * (création de réservation, vérification de code, achat de carte cadeau).
 * En mémoire par instance : sur une infrastructure multi-instances, il faut
 * la doubler d'un compteur partagé (Upstash Redis, Vercel KV) — l'interface
 * ci-dessous ne changera pas.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Purge périodique : évite que la table ne grossisse indéfiniment. */
function sweep(now: number): void {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Secondes avant la prochaine tentative autorisée. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * Identifiant d'appelant, dérivé des en-têtes du proxy.
 * Sans en-tête exploitable, on retombe sur une clé commune : la limite
 * devient globale plutôt qu'inopérante.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'inconnu';
  return `${scope}:${ip}`;
}
