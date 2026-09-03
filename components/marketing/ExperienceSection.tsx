import { Section } from '@/components/ui/Section';
import { Eyebrow, Lead } from '@/components/ui/Heading';
import { Reveal, RevealLines, RevealRule } from '@/components/ui/Reveal';
import { Arch } from '@/components/ui/Arch';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';

/**
 * Chaque étape porte son geste. Les photos sont cadrées large (16:9) et
 * viennent se loger dans une arche verticale : `objectPosition` désigne
 * donc explicitement le point d'intérêt, sans quoi le centre géométrique
 * couperait les mains hors du cadre.
 *
 * Le `sizes` dépasse volontiers la largeur de la colonne : `object-cover`
 * cale la photo sur la hauteur de l'arche, et il faut donc environ
 * `hauteur × 1,83` pixels de source — sinon le navigateur choisit une
 * variante deux fois trop petite et l'agrandit.
 */
const steps = [
  {
    title: 'Écouter',
    text: 'Chaque séance commence par un court échange afin de comprendre les attentes et préférences du client.',
    image: '/images/gestes/mains-dos.jpg',
    alt: 'Les deux mains du praticien posées à plat sur le haut du dos, au début de la séance.',
    objectPosition: '58% center',
  },
  {
    title: 'Personnaliser',
    text: 'Le rythme, la pression et les zones travaillées sont adaptés à chaque personne.',
    image: '/images/gestes/nuque.jpg',
    alt: 'Les pouces du praticien travaillant la base de la nuque, pression appuyée et lente.',
    objectPosition: '48% center',
  },
  {
    title: 'Ralentir',
    text: 'La séance se termine progressivement pour prolonger naturellement la sensation de détente.',
    image: '/images/gestes/serviettes-chaudes.jpg',
    alt: 'Serviettes chaudes déposées sur le dos en fin de séance, la vapeur encore visible.',
    objectPosition: '52% center',
  },
];

export function ExperienceSection() {
  return (
    <Section tone="ink" spacing="lg" aria-labelledby="experience-titre">
      <div className="max-w-3xl">
        <Eyebrow>L’expérience</Eyebrow>
        <RevealLines
          as="h2"
        id="experience-titre"
          className="mt-5 font-heading text-[2.5rem] font-light leading-[1.04] sm:text-[3.5rem]"
          lines={[
            'Plus qu’un massage.',
            <em key="l2" className="font-normal italic text-terracotta">
              Un moment pour soi.
            </em>,
          ]}
        />
        <Lead className="mt-7 text-ivory-70">
          L’expérience Alhambra commence dès l’arrivée. Lumière douce, matières naturelles, musique
          discrète et attention portée à chaque détail créent un espace où l’on peut enfin ralentir.
        </Lead>
      </div>

      <ol className="mt-20 grid gap-14 sm:grid-cols-3 sm:gap-10">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title} delay={index * 0.1} className="relative">
            <Arch delay={index * 0.1 + 0.05} className="relative aspect-3/4 w-full">
              <PlaceholderImage
                src={step.image}
                alt={step.alt}
                sizes="(max-width: 640px) 245vw, 68vw"
                objectPosition={step.objectPosition}
                className="h-full w-full"
              />
            </Arch>
            <span className="mt-7 block font-body text-xs tracking-[0.26em] text-champagne">
              0{index + 1}
            </span>
            <RevealRule className="mt-5" />
            <h3 className="mt-6 font-heading text-[1.75rem] font-light">{step.title}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-ivory-70">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
