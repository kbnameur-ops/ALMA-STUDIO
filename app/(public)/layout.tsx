import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBar } from '@/components/layout/MobileBar';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { JsonLd } from '@/components/layout/JsonLd';
import { localBusinessJsonLd } from '@/lib/seo';

/** Habillage commun aux pages publiques : en-tête, pied de page, bandeaux. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <MobileBar />
      <CookieBanner />
    </>
  );
}
