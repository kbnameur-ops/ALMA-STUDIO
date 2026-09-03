/** Génération de codes lisibles (cartes cadeaux, références de secours). */

// Alphabet sans caractères ambigus (0/O, 1/I) : dictable au téléphone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export function randomCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = '';
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return code;
}

/** Code carte cadeau, ex. `ALMA-4KQ7-J92X`. */
export function giftCardCode(): string {
  return `ALMA-${randomCode(4)}-${randomCode(4)}`;
}

/** Jeton d'accès à la page « gérer ma réservation ». */
export function manageToken(): string {
  return Array.from(randomBytes(24), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
