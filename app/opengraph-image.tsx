import { ImageResponse } from 'next/og';
import { brand } from '@/config/brand';

/**
 * Image de partage générée à la volée.
 * Rendue en composants simples (aucune police distante) : la génération
 * reste rapide et ne dépend d'aucun réseau externe.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${brand.name} — ${brand.signature}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: `linear-gradient(155deg, #1c1813 0%, ${brand.colors.ink} 55%, ${brand.colors.inkDeep} 100%)`,
          color: brand.colors.ivory,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 46, letterSpacing: 22, display: 'flex' }}>
            {brand.nameParts.primary}
          </div>
          <div
            style={{
              fontSize: 17,
              letterSpacing: 18,
              marginTop: 12,
              color: brand.colors.terracotta,
              display: 'flex',
            }}
          >
            {brand.nameParts.secondary}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 66, lineHeight: 1.1, maxWidth: 880, display: 'flex' }}>
            {brand.tagline}
          </div>
          <div
            style={{
              fontSize: 22,
              marginTop: 28,
              letterSpacing: 4,
              // Ivoire atténué : l'ancienne valeur (rgba(48,42,37,…), l'encre
              // pré-refonte) rendait ce libellé quasi invisible sur le fond
              // sombre actuel — un reliquat du passage au thème nocturne
              // repéré en resynchronisant ce fichier aujourd'hui.
              color: 'rgba(242,238,231,0.55)',
              display: 'flex',
            }}
          >
            {brand.signature.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
