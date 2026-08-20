import 'server-only';

import { cache } from 'react';
import { seedReviews } from '@/config/seed';
import { getServerClient } from '@/lib/supabase/server';
import type { Review } from '@/types';
import { toReview } from './mappers';

/**
 * Avis clients publiés.
 * Les entrées `isSample` sont des exemples de mise en page : l'affichage
 * doit les signaler explicitement (voir `components/marketing/Reviews`).
 */
export const getPublishedReviews = cache(async (limit = 6): Promise<Review[]> => {
  const db = await getServerClient();
  if (!db) return seedReviews.slice(0, limit);

  const { data, error } = await db
    .from('reviews')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[reviews] lecture impossible', error.message);
    return seedReviews.slice(0, limit);
  }
  return (data ?? []).map(toReview);
});
