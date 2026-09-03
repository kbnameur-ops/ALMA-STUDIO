import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

/** Déconnexion du back-office : POST uniquement, pour éviter toute déconnexion par simple lien. */
export async function POST(request: Request) {
  const db = await getServerClient();
  await db?.auth.signOut();
  return NextResponse.redirect(new URL('/admin/connexion', request.url), { status: 303 });
}
