import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { getServices } from '@/lib/repositories/services';

/** Plan du site. Les pages légales et les pages privées en sont exclues. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = ([
    { url: `${site.url}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/massages`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/reservation`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site.url}/studio`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site.url}/carte-cadeau`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site.url}/a-propos`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${site.url}/faq`, changeFrequency: 'monthly', priority: 0.5 },
  ] as const).map((entry) => ({ ...entry, lastModified: now }));

  return [
    ...staticPages,
    ...services.map((service) => ({
      url: `${site.url}/massages/${service.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
