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
          background: `linear-gradient(150deg, ${brand.colors.sand} 0%, #dfd2c0 60%, ${brand.colors.champagne} 100%)`,
          color: brand.colors.espresso,
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
              color: 'rgba(48,42,37,0.65)',
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
