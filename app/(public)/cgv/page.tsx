import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';
import { site } from '@/config/site';
import { brand } from '@/config/brand';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Conditions générales de vente',
  description: `Conditions de réservation, de paiement et d’annulation des prestations ${brand.name}.`,
  path: '/cgv',
  noIndex: true,
});

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales de vente" updatedAt="[DATE_MISE_A_JOUR]">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent la vente des prestations de bien-être proposées par{' '}
          {site.legal.companyName}, exploitant sous l’enseigne {brand.name}, réservables sur le
          présent site.
        </p>
      </section>

      <section>
        <h2>2. Nature des prestations</h2>
        <p>
          Les prestations proposées sont des massages de bien-être et de relaxation. Elles ne
          constituent ni un acte médical, ni un soin thérapeutique, ni un acte de kinésithérapie, et
          n’ont aucune visée curative. Le studio se réserve le droit de refuser ou d’interrompre une
          séance dont le déroulement ne respecterait pas ce cadre.
        </p>
      </section>

      <section>
        <h2>3. Réservation</h2>
        <p>
          La réservation s’effectue en ligne. Elle n’est définitive qu’après confirmation du
          paiement. Un email récapitulatif est envoyé à l’adresse indiquée lors de la réservation.
        </p>
      </section>

      <section>
        <h2>4. Prix et paiement</h2>
        <p>
          Les prix sont indiqués en euros toutes taxes comprises. Le tarif applicable est celui
          affiché au moment de la réservation. Le paiement s’effectue en ligne par carte bancaire
          via Stripe. Des frais de déplacement s’ajoutent pour les prestations à domicile ; ils sont
          affichés avant validation du paiement.
        </p>
      </section>

      <section>
        <h2>5. Annulation et modification</h2>
        <p>
          La réservation peut être modifiée ou annulée sans frais jusqu’à {site.cancellationHours}{' '}
          heures avant l’heure du rendez-vous, depuis le lien « Gérer ma réservation » figurant dans
          l’email de confirmation. Passé ce délai, la prestation est due. En cas d’annulation dans
          les délais, le remboursement est effectué sur le moyen de paiement d’origine.
        </p>
        <p>
          En cas d’empêchement du studio, la séance est reportée ou intégralement remboursée, au
          choix du client.
        </p>
      </section>

      <section>
        <h2>6. Retard</h2>
        <p>
          En cas de retard, la séance se termine à l’heure initialement prévue afin de ne pas
          décaler le rendez-vous suivant. Le tarif reste inchangé.
        </p>
      </section>

      <section>
        <h2>7. Cartes cadeaux</h2>
        <p>
          Les cartes cadeaux sont valables douze mois à compter de leur date d’émission. Elles sont
          nominatives, utilisables en une ou plusieurs fois jusqu’à épuisement du solde, non
          remboursables et non échangeables contre des espèces.
        </p>
      </section>

      <section>
        <h2>8. Droit de rétractation</h2>
        <p>
          Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne
          s’applique pas aux prestations de services de bien-être fournies à une date déterminée. La
          politique d’annulation décrite à l’article 5 s’applique en lieu et place.
        </p>
      </section>

      <section>
        <h2>9. Responsabilité</h2>
        <p>
          Le client s’engage à signaler toute contre-indication éventuelle avant la séance. Le
          studio ne saurait être tenu responsable des conséquences d’une information non
          communiquée.
        </p>
      </section>

      <section>
        <h2>10. Droit applicable</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une solution
          amiable sera recherchée avant toute action judiciaire. Le client peut recourir gratuitement
          au médiateur de la consommation : [MEDIATEUR_CONSOMMATION].
        </p>
      </section>
    </LegalPage>
  );
}
