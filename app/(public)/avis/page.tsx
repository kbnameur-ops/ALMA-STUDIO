import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { Eyebrow, Heading, Lead } from '@/components/ui/Heading';
import { ReviewForm } from '@/components/forms/ReviewForm';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Laisser un avis',
  description: 'Partagez votre retour après une séance au studio.',
  path: '/avis',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;

  return (
    <Section tone="ink" spacing="lg" className="pt-32 sm:pt-40" containerWidth="narrow">
      <Eyebrow>Votre retour</Eyebrow>
      <Heading level={1} size="lg" className="mt-4">
        Comment s’est passée votre séance ?
      </Heading>
      <Lead className="mt-6 text-ivory-70">
        Quelques mots suffisent. Votre message nous aide à ajuster ce qui peut l’être — et, si vous
        l’acceptez, il pourra figurer sur le site après relecture.
      </Lead>

      <div className="mt-12">
        <ReviewForm reference={params.ref ?? null} />
      </div>
    </Section>
  );
}
