import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/supabase/admin-auth';

export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};

/**
 * Gabarit protégé du back-office.
 *
 * La page de connexion vit dans un autre groupe de routes
 * (`app/(admin-auth)`) : elle partage l'URL `/admin/…` sans hériter de
 * cette protection, ce qui évite toute boucle de redirection.
 */
/** L'administration lit des données vivantes : aucun rendu mis en cache. */
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Deuxième barrière, indépendante du middleware : session valide **et**
  // compte listé dans `admin_users`.
  const session = await getAdminSession();
  if (!session) redirect('/admin/connexion');

  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      <AdminSidebar email={session.email} />
      <main id="contenu" className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
