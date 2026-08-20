import type { Appearance } from '@stripe/stripe-js';
import { brand } from '@/config/brand';

/**
 * Habillage des champs Stripe aux couleurs ALMA, pour que l'étape de
 * paiement ne casse pas la continuité visuelle du tunnel.
 */
export const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: brand.colors.terracotta,
    colorBackground: brand.colors.ivory,
    colorText: brand.colors.espresso,
    colorDanger: brand.colors.terracotta,
    fontFamily: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(48, 42, 37, 0.22)',
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
      color: 'rgba(48, 42, 37, 0.7)',
    },
  },
};
