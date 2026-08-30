import Link from 'next/link';
import { brand } from '@/config/brand';
import { site } from '@/config/site';
import { legalNav } from '@/config/navigation';
import { Container } from '@/components/ui/Container';
import { Logo } from './Logo';

const exploreLinks = [
  { label: 'Massages', href: '/massages' },
  { label: 'Le Studio', href: '/studio' },
  { label: 'Carte cadeau', href: '/carte-cadeau' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Réserver', href: '/reservation' },
];

export function Footer() {
  return (
    <footer className="bg-ink-deep pb-20 text-ivory sm:pb-0">
      <Container width="wide" className="py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo tone="light" />
            <p className="mt-6 max-w-xs font-body text-sm leading-relaxed text-ivory/70">
              {brand.signature}
              <br />
              {site.businessAddress.city}
            </p>
            <p className="mt-4 font-heading text-xl font-light text-ivory/90">{brand.tagline}</p>
          </div>

          <nav aria-label="Pages du site">
            <h2 className="font-body text-[0.7rem] uppercase tracking-[0.22em] text-champagne">
              Explorer
            </h2>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ivory/75 transition-colors hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-body text-[0.7rem] uppercase tracking-[0.22em] text-champagne">
              Contact
            </h2>
            <ul className="mt-5 space-y-3 font-body text-sm text-ivory/75">
              <li>
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="break-all transition-colors hover:text-ivory"
                >
                  {site.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.contactPhoneE164}`}
                  className="transition-colors hover:text-ivory"
                >
                  {site.contactPhone}
                </a>
              </li>
              {site.whatsapp.enabled && (
                <li>
                  <a
                    href={site.whatsapp.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-ivory"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              <li className="pt-2 text-ivory/55">{site.openingHoursLabel}</li>
              <li className="text-ivory/55">
                {site.businessAddress.venue}
                <br />
                {site.businessAddress.street}
                <br />
                {site.businessAddress.postalCode} {site.businessAddress.city}
              </li>
              <li className="text-ivory/55">{site.transit}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-ivory/50">
            © {new Date().getFullYear()} {brand.name}. Tous droits réservés.
          </p>
          <nav aria-label="Informations légales">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-xs text-ivory/50 transition-colors hover:text-ivory/80"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
