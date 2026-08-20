import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import {
  isSupabaseConfigured,
  requireServiceRoleKey,
  supabaseAnonKey,
  supabaseUrl,
} from './env';

export type Db = SupabaseClient<Database>;

/**
 * Client lié à la session du visiteur : soumis aux politiques RLS.
 * À utiliser pour toute lecture publique et pour l'authentification admin.
 */
export async function getServerClient(): Promise<Db | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : le rafraîchissement de
          // session est alors géré par le middleware, on ignore l'erreur.
        }
      },
    },
  });
}

/**
 * Client privilégié (service role), qui contourne RLS.
 *
 * Réservé aux opérations serveur de confiance : écriture de réservation,
 * webhooks Stripe, tâches planifiées. Ne jamais l'exposer à une entrée
 * utilisateur non validée, ni l'importer depuis un composant client.
 */
export function getAdminClient(): Db | null {
  if (!supabaseUrl) return null;
  return createClient<Database>(supabaseUrl, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
