import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { LinkButton } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

/** Page 404, habillée comme le reste du site plutôt qu'en page technique. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-ink py-24">
      <Container width="narrow">
        <Logo />
        <Heading level={1} size="lg" className="mt-12">
          Cette page n’existe pas.
        </Heading>
        <p className="mt-5 font-body text-sm leading-relaxed text-ivory-70">
          Le lien est peut-être ancien, ou l’adresse comporte une erreur. Reprenons depuis le début.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <LinkButton href="/">Retour à l’accueil</LinkButton>
          <LinkButton href="/massages" variant="secondary">
            Voir les massages
          </LinkButton>
          <Link
            href="/reservation"
            className="self-center font-body text-sm text-terracotta underline underline-offset-4"
          >
            Réserver une séance
          </Link>
        </div>
      </Container>
    </main>
  );
}
