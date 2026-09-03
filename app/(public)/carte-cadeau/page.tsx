import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { GiftCardForm } from '@/components/forms/GiftCardForm';
import { getServices } from '@/lib/repositories/services';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Carte cadeau',
  description:
    'Offrez une séance au studio : carte cadeau valable 12 mois, envoyée par email avec votre message personnel. Montant libre ou prestation au choix.',
  path: '/carte-cadeau',
});

export const dynamic = 'force-dynamic';

const steps = [
  'Choisissez une prestation ou un montant.',
  'Personnalisez la carte avec votre message.',
  'Réglez en ligne : la carte part immédiatement par email.',
];

export default async function GiftCardPage() {
  const services = await getServices();

  return (
    <>
      <Section tone="raised" spacing="lg" className="pt-32 sm:pt-40" containerWidth="wide">
        <div className="max-w-2xl">
          <Eyebrow>Carte cadeau</Eyebrow>
          <Heading level={1} size="xl" className="mt-4">
            Offrez une parenthèse.
          </Heading>
          <Lead className="mt-6 text-ivory-70">
            Une carte cadeau Alhambra, valable douze mois, utilisable sur toutes les prestations du
            studio. Envoyée par email au bénéficiaire, avec votre message.
          </Lead>

          <ol className="mt-10 space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-4 font-body text-sm text-ivory-70">
                <span className="text-champagne">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <section className="bg-ink py-20 sm:py-24">
        <Container width="wide">
          <GiftCardForm services={services} />
        </Container>
      </section>
    </>
  );
}
