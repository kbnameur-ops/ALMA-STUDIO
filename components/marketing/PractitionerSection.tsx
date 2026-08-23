import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Heading';
import { Arch } from '@/components/ui/Arch';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { site } from '@/config/site';

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
            src="/images/equipe/praticien.jpg"
            alt={`Portrait de ${site.practitioner.name}, praticien du studio ALMA.`}
            sizes="(max-width: 1024px) 100vw, 38vw"
            objectPosition="center 22%"
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
              {site.practitioner.name}
            </p>

            <div className="mt-7 space-y-6 font-body text-sm leading-relaxed text-espresso-70">
              {site.practitioner.bio.map((paragraphe) => (
                <p key={paragraphe.slice(0, 32)}>{paragraphe}</p>
              ))}

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
                {/* « Formation » seule : aucune durée d'exercice n'a été
                    communiquée, et il n'est pas question d'en inventer une. */}
                <h3 className="font-body text-[0.68rem] uppercase tracking-[0.2em] text-champagne">
                  Formation
                </h3>
                <ul className="mt-4 space-y-5">
                  {site.practitioner.training.map((school) => (
                    <li key={school.school}>
                      <p className="font-heading text-lg font-light leading-snug text-espresso">
                        {school.school}
                      </p>
                      <p className="mt-1 font-body text-xs uppercase tracking-[0.16em] text-espresso-55">
                        {school.city}
                      </p>
                      <p className="mt-2">{school.topics.join(' · ')}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
