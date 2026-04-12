import { MetadataRoute } from 'next';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gs-good-stuff';
const BASE_API = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gsgoodstuff.com';

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    // Varieties
    const vRes = await fetch(`${BASE_API}/varieties`, { cache: 'no-store' });
    if (vRes.ok) {
      const vData = await vRes.json();
      (vData.documents || []).forEach((doc: any) => {
        const fields = doc.fields || {};
        const status = fields.status?.stringValue;
        const count = parseInt(fields.count?.integerValue || '0');
        if (status === 'listed' && count > 0) {
          routes.push({ url: `${baseUrl}/shop/${doc.name.split('/').pop()}`, lastModified: new Date(), changeFrequency: 'always' as const, priority: 0.7 });
        }
      });
    }

    // Public journal entries
    const jRes = await fetch(`${BASE_API}/journal_entries`, { cache: 'no-store' });
    if (jRes.ok) {
      const jData = await jRes.json();
      (jData.documents || []).forEach((doc: any) => {
        const fields = doc.fields || {};
        if (fields.is_public?.booleanValue) {
          routes.push({ url: `${baseUrl}/blog/${doc.name.split('/').pop()}`, lastModified: new Date(), changeFrequency: 'never' as const, priority: 0.6 });
        }
      });
    }
  } catch (err) {
    console.error("Sitemap fetch failed:", err);
  }

  return routes;
}
