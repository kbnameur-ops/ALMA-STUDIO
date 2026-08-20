import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware d'accès au back-office.
 *
 * Il rafraîchit la session Supabase et bloque `/admin` sans session. Le
 * contrôle réel des droits (appartenance à `admin_users`) est refait dans
 * le layout serveur : le middleware n'est qu'un premier filtre, jamais la
 * seule barrière.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/connexion';

  if (isAdminRoute && !isLoginRoute && !user) {
    const redirect = new URL('/admin/connexion', request.url);
    redirect.searchParams.set('suivant', request.nextUrl.pathname);
    return NextResponse.redirect(redirect);
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
