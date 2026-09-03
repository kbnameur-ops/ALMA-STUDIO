import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { PractitionerSection } from '@/components/marketing/PractitionerSection';
import { pageMetadata } from '@/lib/seo';
import { brand } from '@/config/brand';

export const metadata: Metadata = pageMetadata({
  title: 'À propos',
  description:
    'ALMA STUDIO, studio privé de massage à Paris : une approche du bien-être fondée sur l’écoute, la personnalisation et le temps long.',
  path: '/a-propos',
});

const values = [
  {
    title: 'L’écoute d’abord',
    text: 'Aucune séance ne commence sans avoir compris ce que vous venez chercher ce jour-là. C’est ce court échange qui détermine tout le reste.',
  },
  {
    title: 'Le juste geste',
    text: 'Ni démonstration technique, ni séance standardisée. La pression et le rythme se règlent sur vous, et se réajustent en cours de séance.',
  },
  {
    title: 'Le temps qu’il faut',
    text: 'Les rendez-vous sont espacés pour que personne n’ait à se presser — ni vous à l’arrivée, ni nous à la fin.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Section tone="raised" spacing="lg" className="pt-32 sm:pt-40" containerWidth="wide">
        <div className="max-w-3xl">
          <Eyebrow>À propos</Eyebrow>
          <Heading level={1} size="xl" className="mt-4">
            {brand.tagline}
          </Heading>
          <Lead className="mt-6 text-ivory-70">
            {brand.name} est un studio privé dédié au massage de bien-être et aux rituels de
            relaxation. L’inspiration vient de l’héritage arabo-andalou et du hammam : des matières
            simples, une lumière chaude, et l’idée qu’un moment pour soi n’a pas besoin d’être
            compliqué pour être précieux.
          </Lead>
        </div>
      </Section>

      <Section tone="ink" spacing="lg" containerWidth="wide">
        <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {values.map((value) => (
            <div key={value.title}>
              <span className="alma-rule" aria-hidden />
              <dt className="mt-5 font-heading text-2xl font-light">{value.title}</dt>
              <dd className="mt-3 font-body text-sm leading-relaxed text-ivory-70">
                {value.text}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <PractitionerSection />

      <Section tone="raised" spacing="md" containerWidth="narrow" className="text-center">
        <Heading size="lg">Envie de ralentir ?</Heading>
        <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed text-ivory-70">
          Choisissez une séance, un créneau, et laissez-vous le reste du temps.
        </p>
        <LinkButton href="/reservation" size="lg" className="mt-8">
          Réserver une séance
        </LinkButton>
      </Section>
    </>
  );
}
