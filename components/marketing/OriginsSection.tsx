import { Eyebrow } from '@/components/ui/Heading';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { ArchMark } from '@/components/brand/ArchMark';

/**
 * L'héritage, en deux gestes : le rituel et le mouvement.
 *
 * Le repositionnement du studio tient sur une idée qu'aucune autre section
 * ne pose explicitement : un même héritage arabo-andalou, porté par deux
 * gestes — celui, ancestral, du hammam, et celui du praticien lui-même,
 * façonné par des années de scène et de mouvement. Sans ce moment, la
 * biographie du praticien et le catalogue restent deux pages sans lien
 * entre elles.
 *
 * Le panneau reprend la technique du halo chaud déjà utilisée ailleurs sur
 * le site (`.alma-sun`), dédoublée : un halo ocre à gauche pour la chaleur
 * du rituel, une brume bleu-gris à droite pour la vapeur du hammam et la
 * précision du geste. Les deux couleurs d'accent n'existent que dans cette
 * section, jamais dans le chrome du site (en-tête, boutons, pied de page
 * restent champagne/terracotta), pour que le moment reste un moment et ne
 * dilue pas l'identité déjà posée.
 */
export function OriginsSection() {
  return (
    <section aria-labelledby="origines-titre" className="relative overflow-hidden bg-ink-deep">
      <div className="mx-auto max-w-6xl px-5 pt-24 text-center sm:px-8 sm:pt-32 lg:px-12">
        <Eyebrow>L’héritage</Eyebrow>
        <RevealLines
          as="h2"
          id="origines-titre"
          className="mx-auto mt-5 max-w-2xl font-heading text-[2.25rem] leading-[1.05] text-ivory sm:text-[3.25rem]"
          lines={['Un même héritage,', 'deux gestes.']}
        />
      </div>

      <div className="relative mt-16 grid sm:grid-cols-2">
        {/* Le rituel — chaleur, transmission, gestes ancestraux. */}
        <Reveal className="relative overflow-hidden px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(75% 65% at 50% 100%, rgba(201, 151, 74, 0.22) 0%, rgba(201, 151, 74, 0.05) 45%, transparent 72%)',
            }}
          />
          <div className="relative mx-auto max-w-sm">
            <span className="font-body text-[0.62rem] uppercase tracking-[0.34em] text-ocre">
              Le rituel
            </span>
            <p className="mt-5 font-heading text-2xl leading-snug text-ivory sm:text-[1.75rem]">
              La chaleur du hammam.
            </p>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
              Des gestes transmis, ancestraux, pensés pour libérer les tensions en profondeur —
              l’héritage arabo-andalou dans toute sa densité.
            </p>
          </div>
        </Reveal>

        {/* Séparation verticale, avec le monogramme au point de jonction. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-ivory/10 sm:block"
        >
          <ArchMark
            size={40}
            tone="mono-light"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink-deep px-2 text-champagne"
          />
        </div>
        <div aria-hidden className="mx-auto h-px w-16 bg-ivory/10 sm:hidden" />

        {/* Le geste — précision, mouvement, écoute du corps. */}
        <Reveal delay={0.1} className="relative overflow-hidden px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(75% 65% at 50% 100%, rgba(167, 139, 181, 0.18) 0%, rgba(167, 139, 181, 0.04) 45%, transparent 72%)',
            }}
          />
          <div className="relative mx-auto max-w-sm">
            <span className="font-body text-[0.62rem] uppercase tracking-[0.34em] text-brume">
              Le geste
            </span>
            <p className="mt-5 font-heading text-2xl leading-snug text-ivory sm:text-[1.75rem]">
              La brume qui enveloppe.
            </p>
            <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
              Une lecture du corps affinée par des années de scène et de mouvement — pour que
              chaque soin s’adapte, jamais générique.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
