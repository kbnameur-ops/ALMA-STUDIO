import { describe, expect, it } from 'vitest';
import { giftCardCode, manageToken, randomCode } from '@/lib/booking/reference';

describe('randomCode', () => {
  it('respecte la longueur demandée', () => {
    expect(randomCode(8)).toHaveLength(8);
    expect(randomCode(4)).toHaveLength(4);
  });

  it('évite les caractères ambigus dictés au téléphone', () => {
    const sample = Array.from({ length: 200 }, () => randomCode(12)).join('');
    expect(sample).not.toMatch(/[01IO]/);
  });

  it('ne produit pas deux fois la même valeur', () => {
    const codes = new Set(Array.from({ length: 500 }, () => randomCode(8)));
    expect(codes.size).toBe(500);
  });
});

describe('giftCardCode', () => {
  it('suit le format ALHAMBRA-XXXX-XXXX', () => {
    expect(giftCardCode()).toMatch(/^ALHAMBRA-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});

describe('manageToken', () => {
  it('produit 48 caractères hexadécimaux (24 octets)', () => {
    const token = manageToken();
    expect(token).toMatch(/^[0-9a-f]{48}$/);
  });

  it('est unique à chaque appel', () => {
    expect(manageToken()).not.toBe(manageToken());
  });
});
