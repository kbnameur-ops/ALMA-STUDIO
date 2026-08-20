/**
 * Détection de la configuration Supabase.
 *
 * Le site doit pouvoir être construit et parcouru sans backend (aperçu
 * design, CI, onboarding). Quand les variables sont absentes, la couche
 * `lib/repositories` bascule sur les données de démonstration au lieu
 * d'échouer — la logique métier, elle, reste strictement identique.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

/** Vrai uniquement côté serveur : la clé de service ne fuit jamais au client. */
export function hasServiceRole(): boolean {
  return supabaseUrl.length > 0 && serviceRoleKey.length > 0;
}

export function requireServiceRoleKey(): string {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY manquante : opération serveur impossible.',
    );
  }
  return serviceRoleKey;
}
