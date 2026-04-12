"use client";

import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { app, db } from "./firebase";

let messagingInstance: any = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (!supported) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

/**
 * Request notification permission and register FCM token.
 * Returns the token if successful, null if denied or unsupported.
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Save token to Firestore under user document
      await saveFcmToken(userId, token);
      console.log("FCM token registered:", token.substring(0, 20) + "...");
    }

    return token;
  } catch (err) {
    console.error("Notification permission error:", err);
    return null;
  }
}

/**
 * Save FCM token to Firestore user document.
 */
async function saveFcmToken(userId: string, token: string) {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    fcm_tokens: arrayUnion(token),
    updated_at: new Date(),
  }, { merge: true });
}

/**
 * Listen for foreground messages and call the callback.
 */
export function onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
  if (typeof window === 'undefined') return null;

  let unsubscribe: (() => void) | null = null;

  getMessagingInstance().then((messaging) => {
    if (!messaging) return;
    unsubscribe = onMessage(messaging, callback) as any;
  });

  return () => { if (unsubscribe) unsubscribe(); };
}

/**
 * Check if notifications are supported and permission status.
 */
export function getNotificationStatus(): 'unsupported' | 'default' | 'granted' | 'denied' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
