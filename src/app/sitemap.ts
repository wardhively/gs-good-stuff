import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gsgoodstuff.com';

  // Base routes natively tracking core layouts
  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    // Collect active varieties
    const vSnap = await adminDb.collection("varieties")
       .where("status", "==", "listed")
       .where("count", ">", 0)
       .get();
    
    vSnap.docs.forEach(doc => {
       routes.push({
          url: `${baseUrl}/shop/${doc.id}`,
          lastModified: doc.data().updated_at ? new Date(doc.data().updated_at.seconds * 1000) : new Date(),
          changeFrequency: 'always',
          priority: 0.7
       });
    });

    // Collect public journals
    const jSnap = await adminDb.collection("journal_entries")
       .where("is_public", "==", true)
       .get();
    
    jSnap.docs.forEach(doc => {
       routes.push({
          url: `${baseUrl}/blog/${doc.id}`,
          lastModified: doc.data().updated_at ? new Date(doc.data().updated_at.seconds * 1000) : new Date(),
          changeFrequency: 'never', // archival
          priority: 0.6
       });
    });

  } catch (err) {
    console.error("Sitemap Firebase traversal failed natively:", err);
  }

  return routes;
}
