import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Merci',
  description: 'Votre carte cadeau est en cours d’émission.',
  path: '/carte-cadeau/merci',
  noIndex: true,
});

export default function GiftCardThanksPage() {
  return (
    <section className="bg-ink pb-24 pt-32 sm:pt-40">
      <Container width="narrow">
        <Heading level={1} size="lg">
          Merci — votre carte cadeau est en route.
        </Heading>
        <p className="mt-5 font-body text-sm leading-relaxed text-ivory-70">
          Dès la validation définitive du paiement par notre prestataire, la carte est envoyée au
          bénéficiaire et une copie vous parvient. Cela prend généralement quelques secondes.
        </p>
        <p className="mt-4 font-body text-sm leading-relaxed text-ivory-70">
          Si vous n’avez rien reçu d’ici quelques minutes, pensez à vérifier vos indésirables avant
          de nous écrire — nous vérifierons de notre côté.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <LinkButton href="/">Retour à l’accueil</LinkButton>
          <LinkButton href="/massages" variant="secondary">
            Découvrir les massages
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
