import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';
import { site } from '@/config/site';
import { brand } from '@/config/brand';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Politique de confidentialité',
  description: `Traitement des données personnelles sur le site ${brand.name} : finalités, durées de conservation et exercice de vos droits.`,
  path: '/politique-confidentialite',
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="[DATE_MISE_A_JOUR]">
      <section>
        <h2>Responsable de traitement</h2>
        <p>
          {site.legal.companyName}, {site.businessAddress.street}, {site.businessAddress.postalCode}{' '}
          {site.businessAddress.city}. Contact : {site.contactEmail}.
        </p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>Identité et coordonnées : prénom, nom, email, téléphone.</li>
          <li>Adresse postale, uniquement en cas de prestation à domicile.</li>
          <li>Informations de réservation : prestation, durée, date, lieu, message éventuel.</li>
          <li>Données de paiement : traitées directement par Stripe, jamais stockées par nos soins.</li>
          <li>Mesure d’audience, uniquement après acceptation des cookies correspondants.</li>
        </ul>
        <p>
          Aucune donnée de santé n’est demandée ni collectée lors de la réservation.
        </p>
      </section>

      <section>
        <h2>Finalités et bases légales</h2>
        <ul>
          <li>Gestion des réservations et des paiements — exécution du contrat.</li>
          <li>Envoi des confirmations, rappels et informations de séance — exécution du contrat.</li>
          <li>Communications commerciales — consentement, révocable à tout moment.</li>
          <li>Obligations comptables et fiscales — obligation légale.</li>
          <li>Mesure d’audience — consentement.</li>
        </ul>
      </section>

      <section>
        <h2>Durées de conservation</h2>
        <ul>
          <li>Données de réservation : trois ans à compter du dernier rendez-vous.</li>
          <li>Pièces comptables : dix ans, conformément aux obligations légales.</li>
          <li>Consentement marketing : jusqu’à son retrait, puis trois ans.</li>
          <li>Cookies de mesure d’audience : treize mois au maximum.</li>
        </ul>
      </section>

      <section>
        <h2>Destinataires</h2>
        <p>
          Les données sont accessibles au studio et à ses sous-traitants techniques, strictement
          pour les besoins du service : hébergement et base de données (Supabase), paiement
          (Stripe), envoi des emails (Resend), hébergement du site (Vercel). Aucune donnée n’est
          vendue ni cédée à des tiers à des fins publicitaires.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition
          et de portabilité de vos données. Vous pouvez les exercer en écrivant à {site.contactEmail}.
          Vous avez également le droit d’introduire une réclamation auprès de la CNIL
          (www.cnil.fr).
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site n’utilise aucun cookie publicitaire. Seuls des cookies de mesure d’audience
          peuvent être déposés, après votre acceptation explicite via le bandeau prévu à cet effet.
          Le refus est aussi simple que l’acceptation et n’empêche pas la réservation.
        </p>
      </section>
    </LegalPage>
  );
}
