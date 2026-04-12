import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Relies on GOOGLE_APPLICATION_CREDENTIALS locally, or default app engine on GCP
    // If running strictly in Vercel or isolated environments without service accounts, we must feed credentials:
    // credential: admin.credential.cert({
    //   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    //   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    //   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    // }),
  });
}

const adminDb = admin.firestore();
export { adminDb };
