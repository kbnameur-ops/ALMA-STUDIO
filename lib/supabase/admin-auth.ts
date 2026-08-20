import 'server-only';

import { getServerClient, getAdminClient } from './server';

/**
 * Contrôle d'accès au back-office.
 *
 * Deux barrières indépendantes :
 *  1. une session Supabase valide (cookie signé, vérifiée côté serveur) ;
 *  2. une entrée correspondante dans `admin_users`.
 *
 * Un compte authentifié qui n'est pas listé n'obtient rien : créer un
 * compte sur le projet Supabase ne suffit pas à devenir administrateur.
 */

export interface AdminSession {
  userId: string;
  email: string;
  role: 'owner' | 'staff';
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const db = await getServerClient();
  if (!db) return null;

  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;

  // Lecture privilégiée : `admin_users` n'est pas lisible sans droits.
  const service = getAdminClient();
  if (!service) return null;

  const { data: admin } = await service
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!admin) return null;

  return { userId: admin.id, email: admin.email, role: admin.role };
}

/** Vrai si un annuaire d'administrateurs est exploitable. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
