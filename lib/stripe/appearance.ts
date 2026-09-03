import type { Appearance } from '@stripe/stripe-js';
import { brand } from '@/config/brand';

/**
 * Habillage des champs Stripe aux couleurs Alhambra, pour que l'étape de
 * paiement ne casse pas la continuité visuelle du tunnel.
 */
export const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: brand.colors.terracotta,
    colorBackground: brand.colors.inkRaised,
    colorText: brand.colors.ivory,
    colorDanger: brand.colors.terracotta,
    fontFamily: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(242, 238, 231, 0.2)',
      boxShadow: 'none',
      padding: '12px 14px',
    },
    '.Input:focus': {
      border: `1px solid ${brand.colors.terracotta}`,
      boxShadow: 'none',
      outline: 'none',
    },
    '.Label': {
      fontSize: '11px',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'rgba(242, 238, 231, 0.66)',
    },
  },
};
