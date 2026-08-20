'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils/cn';

const links = [
  { label: 'Tableau de bord', href: '/admin' },
  { label: 'Réservations', href: '/admin/reservations' },
  { label: 'Planning', href: '/admin/planning' },
  { label: 'Prestations', href: '/admin/prestations' },
  { label: 'Clients', href: '/admin/clients' },
  { label: 'Promotions', href: '/admin/promotions' },
  { label: 'Cartes cadeaux', href: '/admin/cartes-cadeaux' },
  { label: 'Avis', href: '/admin/avis' },
];

/** Navigation du back-office : verticale sur écran large, défilante sur mobile. */
export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-sand/12 bg-espresso text-sand lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block lg:px-6">
        <Link href="/admin" className="block">
          <span className="font-heading text-lg font-light tracking-[0.22em] text-ivory">
            {brand.nameParts.primary}
          </span>
          <span className="ml-2 font-body text-[0.55rem] tracking-[0.4em] text-champagne lg:ml-0 lg:mt-1 lg:block">
            ADMIN
          </span>
        </Link>
        <p className="hidden font-body text-xs text-sand/45 lg:mt-4 lg:block">{email}</p>
      </div>

      <nav aria-label="Navigation de l’administration" className="px-3 pb-4 lg:px-4">
        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => {
            const active =
              link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block whitespace-nowrap rounded-md px-3 py-2 font-body text-sm transition-colors',
                    active ? 'bg-sand/12 text-ivory' : 'text-sand/65 hover:bg-sand/8 hover:text-sand',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden px-4 pb-6 lg:block">
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="w-full rounded-md border border-sand/20 px-3 py-2 font-body text-xs text-sand/70 transition-colors hover:border-sand/40 hover:text-sand"
          >
            Se déconnecter
          </button>
        </form>
        <Link
          href="/"
          className="mt-3 block text-center font-body text-xs text-sand/45 transition-colors hover:text-sand/70"
        >
          Voir le site
        </Link>
      </div>
    </aside>
  );
}
