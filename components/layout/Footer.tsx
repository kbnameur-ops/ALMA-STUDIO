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

/** Le placeholder `[EMAIL_CONTACT]` n'est pas transformé en lien mailto. */
function isPlaceholder(value: string): boolean {
  return value.startsWith('[') && value.endsWith(']');
}

export function Footer() {
  return (
    <footer className="bg-espresso pb-20 text-sand sm:pb-0">
      <Container width="wide" className="py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo tone="light" />
            <p className="mt-6 max-w-xs font-body text-sm leading-relaxed text-sand/70">
              {brand.signature}
              <br />
              {site.businessAddress.city}
            </p>
            <p className="mt-4 font-heading text-xl font-light text-sand/90">{brand.tagline}</p>
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
                    className="font-body text-sm text-sand/75 transition-colors hover:text-sand"
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
            <ul className="mt-5 space-y-3 font-body text-sm text-sand/75">
              <li>
                {isPlaceholder(site.contactEmail) ? (
                  <span>{site.contactEmail}</span>
                ) : (
                  <a href={`mailto:${site.contactEmail}`} className="transition-colors hover:text-sand">
                    {site.contactEmail}
                  </a>
                )}
              </li>
              <li>
                {isPlaceholder(site.social.instagram) ? (
                  <span>Instagram · {site.social.instagram}</span>
                ) : (
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-sand"
                  >
                    Instagram
                  </a>
                )}
              </li>
              <li className="pt-2 text-sand/55">{site.openingHoursLabel}</li>
              <li className="text-sand/55">
                {site.businessAddress.street}, {site.businessAddress.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-sand/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-sand/50">
            © {new Date().getFullYear()} {brand.name}. Tous droits réservés.
          </p>
          <nav aria-label="Informations légales">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-xs text-sand/50 transition-colors hover:text-sand/80"
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
