'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mobileBarNav } from '@/config/navigation';
import { cn } from '@/lib/utils/cn';

const icons: Record<string, React.ReactNode> = {
  '/': (
    <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  ),
  '/massages': <path d="M4 12h16M4 7h16M4 17h10" />,
  '/reservation': (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
};

/**
 * Barre d'actions fixe en bas d'écran (mobile uniquement).
 * Garde la réservation à portée de pouce sur toutes les pages, hors tunnel
 * de réservation où elle ferait doublon avec les boutons d'étape.
 */
export function MobileBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/reservation') || pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-line)] bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
    >
      <ul className="grid grid-cols-3">
        {mobileBarNav.map((item) => {
          const active = pathname === item.href;
          const isBooking = item.href === '/reservation';
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 font-body text-[0.65rem] tracking-wide transition-colors',
                  isBooking ? 'text-terracotta' : active ? 'text-ivory' : 'text-ivory-55',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icons[item.href]}
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
