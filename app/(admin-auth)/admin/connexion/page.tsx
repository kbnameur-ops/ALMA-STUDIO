import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Logo } from '@/components/layout/Logo';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ suivant?: string }>;
}) {
  const params = await searchParams;
  // On n'accepte qu'un chemin interne : évite une redirection vers un site tiers.
  const next =
    params.suivant && params.suivant.startsWith('/admin') ? params.suivant : '/admin';

  return (
    <main className="flex min-h-screen items-center bg-sand py-20">
      <Container width="narrow">
        <div className="mx-auto max-w-sm rounded-lg border border-[color:var(--color-line)] bg-ivory p-8 shadow-soft sm:p-10">
          <Logo />
          <Heading level={1} size="sm" className="mt-8">
            Administration
          </Heading>
          <p className="mt-2 font-body text-sm text-espresso-55">
            Accès réservé à l’équipe du studio.
          </p>
          <div className="mt-8">
            <LoginForm next={next} />
          </div>
        </div>
      </Container>
    </main>
  );
}
