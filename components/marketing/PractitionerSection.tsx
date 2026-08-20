import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading } from '@/components/ui/Heading';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Présentation du praticien.
 *
 * Aucun diplôme, aucune certification et aucune durée d'expérience ne sont
 * inventés : les informations non fournies restent des placeholders
 * explicites, à remplacer par les éléments réels avant mise en ligne.
 */
export function PractitionerSection() {
  return (
    <Section tone="ivory" spacing="lg" containerWidth="wide" aria-labelledby="praticien-titre">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <PlaceholderImage
            src={null}
            alt="Portrait du praticien du studio ALMA"
            token="[PHOTO_PRATICIEN]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="aspect-3/4 w-full rounded-lg"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Le praticien</Eyebrow>
          <Heading id="praticien-titre" size="lg" className="mt-4">
            Entre de bonnes mains.
          </Heading>

          <p className="mt-6 font-heading text-2xl font-light text-espresso">[PRENOM_PRATICIEN]</p>

          <div className="mt-6 space-y-5 font-body text-sm leading-relaxed text-espresso-70">
            <p>[BIOGRAPHIE_PRATICIEN]</p>
            <div>
              <h3 className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                Philosophie
              </h3>
              <p className="mt-2">
                Une séance réussie n’est pas une séance intense : c’est une séance juste. Écouter
                d’abord, ajuster ensuite, et laisser au corps le temps de relâcher.
              </p>
            </div>
            <div>
              <h3 className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
                Formation &amp; expérience
              </h3>
              <p className="mt-2">[FORMATION_PRATICIEN]</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
