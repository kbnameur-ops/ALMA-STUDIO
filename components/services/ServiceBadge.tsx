import { Badge } from '@/components/ui/Badge';
import type { IntensityLevel } from '@/types';

const labels: Record<IntensityLevel, string> = {
  douce: 'Intensité douce',
  moderee: 'Intensité modérée',
  dynamique: 'Intensité dynamique',
};

const tones: Record<IntensityLevel, 'olive' | 'neutral' | 'accent'> = {
  douce: 'olive',
  moderee: 'neutral',
  dynamique: 'accent',
};

/** Traduit le niveau d'intensité en libellé lisible. */
export function ServiceBadge({ intensity }: { intensity: IntensityLevel }) {
  return <Badge tone={tones[intensity]}>{labels[intensity]}</Badge>;
}

export function intensityLabel(intensity: IntensityLevel): string {
  return labels[intensity];
}
