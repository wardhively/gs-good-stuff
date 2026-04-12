import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gs-good-stuff' });
}

const adminDb = admin.firestore();
export { adminDb };
