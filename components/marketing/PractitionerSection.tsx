import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { Arch } from '@/components/ui/Arch';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';

/**
 * Présentation du praticien.
 *
 * Aucun diplôme, aucune certification et aucune durée d'expérience ne sont
 * inventés : les informations non fournies restent des placeholders
 * explicites, à remplacer avant mise en ligne.
 */
export function PractitionerSection() {
  return (
    <Section tone="ivory" spacing="lg" containerWidth="wide" aria-labelledby="praticien-titre">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-24">
        <Arch className="relative aspect-3/4 w-full">
          <PlaceholderImage
            src={null}
            alt="Portrait du praticien du studio ALMA"
            token="[PHOTO_PRATICIEN]"
            sizes="(max-width: 1024px) 100vw, 38vw"
            className="h-full w-full"
          />
        </Arch>

        <div>
          <Eyebrow>Le praticien</Eyebrow>
          <RevealLines
            as="h2"
            className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.25rem]"
            lines={[
              'Entre',
              <em key="l2" className="font-normal italic text-terracotta">
                de bonnes mains.
              </em>,
            ]}
          />

          <Reveal delay={0.12}>
            <p className="mt-8 font-heading text-2xl font-light text-espresso">
              [PRENOM_PRATICIEN]
            </p>

            <div className="mt-7 space-y-6 font-body text-sm leading-relaxed text-espresso-70">
              <p>[BIOGRAPHIE_PRATICIEN]</p>

              <div className="border-l border-champagne/50 pl-5">
                <h3 className="font-body text-[0.68rem] uppercase tracking-[0.2em] text-champagne">
                  Philosophie
                </h3>
                <p className="mt-2 font-heading text-xl font-light italic leading-snug text-espresso">
                  « Une séance réussie n’est pas une séance intense : c’est une séance juste. »
                </p>
                <p className="mt-3">
                  Écouter d’abord, ajuster ensuite, et laisser au corps le temps de relâcher.
                </p>
              </div>

              <div>
                <h3 className="font-body text-[0.68rem] uppercase tracking-[0.2em] text-champagne">
                  Formation &amp; expérience
                </h3>
                <p className="mt-2">[FORMATION_PRATICIEN]</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
