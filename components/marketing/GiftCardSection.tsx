import { Eyebrow } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { GiftCardPreview } from './GiftCardPreview';

const options = ['60 min', '90 min', 'Rituel Andalou-Atlantique', 'Montant libre'];

/**
 * Carte cadeau — bandeau de fin de page.
 *
 * Quatre niches en arche présentaient les formules comme un menu, sans
 * jamais montrer l'objet que l'on offre. C'est pourtant lui l'argument :
 * la carte elle-même est ici au premier plan, et les formules redeviennent
 * ce qu'elles sont, une ligne de mentions.
 *
 * Le bandeau est le plus sombre de la page — c'est sa dernière section
 * avant le pied de page, et la nuit s'y referme.
 */
export function GiftCardSection() {
  return (
    <section
      aria-labelledby="cadeau-titre"
      className="relative overflow-hidden bg-ink-deep py-24 sm:py-32 lg:py-40"
    >
      {/* Lueur unique, derrière la carte : la seule couleur de la section. */}
      <div
        aria-hidden
        className="alma-sun pointer-events-none absolute -right-1/4 top-0 h-full w-2/3 opacity-70"
      />

      <Container width="wide" className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-24">
          <div>
            <Eyebrow className="text-champagne">Carte cadeau</Eyebrow>
            <RevealLines
              as="h2"
              className="mt-5 font-heading text-[2.75rem] leading-[1] text-ivory sm:text-[4rem]"
              lines={[
                'Offrez',
                <em key="l2" className="italic text-champagne">
                  une parenthèse.
                </em>,
              ]}
            />
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-md font-body text-[0.95rem] leading-relaxed text-ivory-70">
                Une carte cadeau ALMA, valable un an, envoyée par email au bénéficiaire avec votre
                message personnel.
              </p>

              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {options.map((option) => (
                  <li
                    key={option}
                    className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-ivory-55"
                  >
                    {option}
                  </li>
                ))}
              </ul>

              <LinkButton href="/carte-cadeau" className="mt-10">
                Offrir une carte cadeau
              </LinkButton>
            </Reveal>
          </div>

          {/* L'objet offert, en grand : c'est lui qu'on vient regarder. */}
          <Reveal delay={0.1} className="lg:pl-8">
            <GiftCardPreview
              amountCents={null}
              serviceLabel="Rituel Andalou-Atlantique"
              recipientName="Inès"
              purchaserName="Thomas"
              message="Prends une heure pour toi."
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
