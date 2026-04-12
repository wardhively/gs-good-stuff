import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Shared helper to send FCM push configurations securely mapping user settings.
 */
export async function sendNotificationToUser(
  userId: string, 
  title: string, 
  body: string
) {
  const db = admin.firestore();
  
  // Hard fetch notification prefs assuming user settings tracks FCM Tokens mapping.
  // Implementation note: a production application will store user FCM tokens typically
  // inside an array like `fcm_tokens` on `users/{userId}` or similar.
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return;

  const data = userDoc.data();
  const tokens = data?.fcm_tokens || [];
  
  if (tokens.length === 0) return;

  const payload = {
    notification: { title, body }
  };

  try {
    await admin.messaging().sendToDevice(tokens, payload);
    console.log(`Successfully sent to device: ${userId}`);
  } catch (err) {
    console.error(`Error sending push: ${userId}`, err);
  }
}

/**
 * Broadcast to all admins (Gary & Suzy defaults) securely.
 */
export async function broadcastAlert(title: string, body: string, filterByFrostPref = false) {
  const db = admin.firestore();
  let query: admin.firestore.Query = db.collection("users").where("role", "==", "admin");
  
  if (filterByFrostPref) {
    query = query.where("settings.frost_alerts", "==", true);
  }

  const admins = await query.get();
  
  let allTokens: string[] = [];
  admins.forEach(doc => {
    const tokens = doc.data().fcm_tokens || [];
    allTokens = allTokens.concat(tokens);
  });

  if (allTokens.length === 0) return;

  try {
    const message = { notification: { title, body }, tokens: allTokens };
    await admin.messaging().sendEachForMulticast(message);
    console.log(`Alert broadcast sent successfully: ${title}`);
  } catch (err) {
    console.error(`Alert broadcast failed`, err);
  }
}
