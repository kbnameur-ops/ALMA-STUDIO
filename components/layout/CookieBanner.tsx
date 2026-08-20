'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { setAnalyticsConsent } from '@/lib/analytics';

const STORAGE_KEY = 'alma-cookie-consent';

/**
 * Bandeau cookies.
 *
 * Le site ne dépose aucun traceur avant choix explicite : la mesure
 * d'audience n'est activée qu'après acceptation, et le refus est aussi
 * accessible que l'acceptation (exigence CNIL).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted') {
      setAnalyticsConsent(true);
      return;
    }
    if (stored === 'denied') return;
    setVisible(true);
  }, []);

  const decide = (granted: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
    setAnalyticsConsent(granted);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Gestion des cookies"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-20 z-[90] rounded-lg border border-[color:var(--color-line)] bg-ivory p-5 shadow-lifted sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm"
        >
          <p className="font-body text-sm leading-relaxed text-espresso-70">
            Nous utilisons uniquement des cookies de mesure d’audience, afin de comprendre
            comment le site est consulté. Aucun cookie publicitaire.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => decide(true)}
              className="rounded-full bg-terracotta px-5 py-2 font-body text-xs font-medium text-ivory transition-colors hover:bg-terracotta-dark"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => decide(false)}
              className="rounded-full border border-[color:var(--color-line-strong)] px-5 py-2 font-body text-xs text-espresso transition-colors hover:border-espresso"
            >
              Refuser
            </button>
            <Link
              href="/politique-confidentialite"
              className="font-body text-xs text-espresso-55 underline underline-offset-4 hover:text-espresso"
            >
              En savoir plus
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
