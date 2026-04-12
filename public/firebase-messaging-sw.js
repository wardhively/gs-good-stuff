// Firebase Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBXUWqWg152eNcHMmyjkOHZz-4P8wsT7r0",
  authDomain: "gs-good-stuff.firebaseapp.com",
  projectId: "gs-good-stuff",
  storageBucket: "gs-good-stuff.firebasestorage.app",
  messagingSenderId: "449438666604",
  appId: "1:449438666604:web:f8978a193ac4868a53ad49",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'G&S Good Stuff', {
    body: body || '',
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'gs-notification',
    data: { url: click_action || data.url || '/' },
    vibrate: [200, 100, 200],
    actions: data.actions ? JSON.parse(data.actions) : [],
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
