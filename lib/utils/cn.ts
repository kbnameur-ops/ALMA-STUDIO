/**
 * Concatène des classes conditionnelles.
 * Volontairement minimal : pas de dépendance externe pour un besoin trivial.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
