import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';
import { site } from '@/config/site';
import { brand } from '@/config/brand';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Mentions légales',
  description: `Mentions légales du site ${brand.name} : éditeur, hébergeur et propriété intellectuelle.`,
  path: '/mentions-legales',
  noIndex: true,
});

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="[DATE_MISE_A_JOUR]">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          {site.legal.companyName} — {site.legal.legalForm}
          <br />
          Capital social : {site.legal.capital}
          <br />
          SIRET : {site.legal.siret}
          <br />
          {site.legal.rcs}
          <br />
          TVA intracommunautaire : {site.legal.vatNumber}
        </p>
        <p>
          Siège social : {site.businessAddress.street}, {site.businessAddress.postalCode}{' '}
          {site.businessAddress.city}
          <br />
          Email : {site.contactEmail}
          <br />
          Téléphone : {site.contactPhone}
        </p>
        <p>Directeur de la publication : {site.legal.director}</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          {site.legal.host}
          <br />
          {site.legal.hostAddress}
        </p>
      </section>

      <section>
        <h2>Activité</h2>
        <p>
          {brand.name} propose des prestations de massage de bien-être et de relaxation. Ces
          prestations ne constituent ni des actes médicaux, ni des soins thérapeutiques, ni des actes
          de kinésithérapie, et ne se substituent en aucun cas à un avis médical.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L’ensemble des contenus de ce site — textes, identité visuelle, photographies et éléments
          graphiques — est protégé par le droit de la propriété intellectuelle. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation écrite préalable, est interdite.
        </p>
      </section>

      <section>
        <h2>Signalement</h2>
        <p>
          Pour toute question relative au contenu de ce site, vous pouvez nous écrire à{' '}
          {site.contactEmail}.
        </p>
      </section>
    </LegalPage>
  );
}
