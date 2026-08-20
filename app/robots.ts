import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Pages personnelles ou techniques : sans intérêt en recherche.
      disallow: ['/admin', '/api/', '/reservation/confirmation', '/reservation/gerer', '/carte-cadeau/merci'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
