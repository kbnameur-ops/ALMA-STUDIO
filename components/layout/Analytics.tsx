'use client';

import Script from 'next/script';
import { analyticsDomain, analyticsId, analyticsProvider } from '@/lib/analytics';

/**
 * Charge le script de mesure d'audience.
 * `afterInteractive` : la mesure ne pèse jamais sur l'affichage initial.
 * Sans fournisseur configuré, rien n'est chargé.
 */
export function Analytics() {
  if (analyticsProvider === 'plausible' && analyticsDomain) {
    return (
      <Script
        defer
        data-domain={analyticsDomain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (analyticsProvider === 'ga' && analyticsId) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${analyticsId}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }

  return null;
}
