'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { bookingHref, mainNav } from '@/config/navigation';
import { cn } from '@/lib/utils/cn';
import { Logo } from './Logo';

/**
 * En-tête collant.
 *
 * Au repos il se fond dans la page ; au scroll il gagne un fond ivoire et
 * un filet discret pour rester lisible au-dessus des visuels. Le bouton
 * « Réserver » reste visible en permanence, y compris sur mobile.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Toute navigation referme le menu : évite un panneau ouvert sur la page suivante.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-alma)]',
        scrolled || menuOpen
          ? 'border-b border-[color:var(--color-line)] bg-ivory/92 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {mainNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative font-body text-sm tracking-wide transition-colors duration-300',
                  active ? 'text-terracotta' : 'text-espresso-70 hover:text-espresso',
                )}
              >
                {item.label}
                {active && (
                  <span aria-hidden className="absolute -bottom-1.5 left-0 h-px w-full bg-terracotta/60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={bookingHref}
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-5 py-2.5 font-body text-xs font-medium tracking-wide text-ivory transition-colors duration-300 hover:bg-terracotta-dark sm:px-6 sm:text-sm"
          >
            Réserver
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-espresso transition-colors hover:bg-[rgba(48,42,37,0.05)] lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 8h16" strokeLinecap="round" />
                  <path d="M4 16h16" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="menu-principal"
            aria-label="Navigation mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[color:var(--color-line)] bg-ivory lg:hidden"
          >
            <ul className="flex flex-col px-5 py-3 sm:px-8">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block border-b border-[color:var(--color-line)] py-4 font-heading text-2xl font-light text-espresso"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={bookingHref}
                  className="block py-4 font-heading text-2xl font-light text-terracotta"
                >
                  Réserver une séance
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
