'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './env';

let cached: SupabaseClient<Database> | null = null;

/** Client navigateur (clé anonyme uniquement, RLS appliqué). */
export function getBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  cached ??= createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return cached;
}
