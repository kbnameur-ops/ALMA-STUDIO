import { brand } from '@/config/brand';
import { LinkButton } from '@/components/ui/Button';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { Container } from '@/components/ui/Container';

/**
 * Hero d'accueil.
 *
 * Image immersive côté fond, texte lisible par-dessus grâce à un voile
 * dégradé. Aucune vidéo : le coût mobile serait disproportionné.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-espresso">
      <PlaceholderImage
        src={null}
        alt="Le studio ALMA, lumière douce et matières naturelles"
        token="[PHOTO_HERO]"
        tone="espresso"
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/45 to-espresso/25"
      />

      <Container width="wide" className="relative pb-24 pt-32 sm:pb-28">
        <div className="max-w-2xl">
          <p className="font-body text-[0.7rem] uppercase tracking-[0.3em] text-champagne">
            {brand.signature}
          </p>
          <h1 className="mt-6 font-heading text-[2.75rem] font-light leading-[1.04] text-ivory text-balance sm:text-6xl lg:text-[4.5rem]">
            {brand.tagline}
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-sand/85 sm:text-lg">
            Massage privé &amp; rituels de bien-être dans un espace intimiste, sur rendez-vous.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <LinkButton href="/reservation" size="lg">
              Réserver une séance
            </LinkButton>
            <LinkButton
              href="/massages"
              variant="light"
              size="lg"
              className="border border-ivory/25 bg-transparent text-ivory hover:bg-ivory/10"
            >
              Découvrir les massages
            </LinkButton>
          </div>

          <p className="mt-8 font-body text-xs uppercase tracking-[0.22em] text-sand/60">
            Studio privé · Sur rendez-vous · Paris
          </p>
        </div>
      </Container>
    </section>
  );
}
