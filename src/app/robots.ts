import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api', '/api/', '/admin', '/admin/'],
    },
    sitemap: 'https://karya.stmik.tazkia.ac.id/sitemap.xml',
  };
}
