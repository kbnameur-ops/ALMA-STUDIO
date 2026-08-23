/**
 * Point d'intérêt des visuels de prestation.
 *
 * Les photos sont en paysage, les cadres du site en arche verticale : le
 * recadrage retire donc environ la moitié de la largeur. Par défaut c'est
 * le centre géométrique qui est retenu, ce qui ne tombe presque jamais sur
 * le sujet.
 *
 * La table est indexée sur le chemin du fichier plutôt que sur le slug de
 * la prestation : le point d'intérêt appartient à la photo, pas au soin.
 * Remplacer une photo par une autre suffit à repartir du centre, sans
 * hériter d'un réglage fait pour l'image précédente.
 *
 * Un chemin absent vaut « centre » — inutile d'y déclarer les photos déjà
 * bien cadrées.
 */
const focusByImage: Record<string, string> = {
  // Les pierres chaudes sont alignées à droite de l'axe de la photo :
  // centrée, l'arche ne montrait que le rideau et la fenêtre.
  '/images/services/espagnol-evasion-3.jpg': '61% center',
};

export function imageFocus(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  return focusByImage[src];
}
