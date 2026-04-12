import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gsgoodstuff.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/map', '/inventory', '/tasks', '/journal', '/more'], // Admin secure paths
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
