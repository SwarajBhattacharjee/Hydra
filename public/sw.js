// HYDRA SERVICE WORKER
const CACHE_NAME = 'hydra-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  let data = { title: 'Hydra Water Check 💧', body: 'Time to drink some water!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: '/' },
    actions: [
      { action: 'drank', title: 'Drank 💧' },
      { action: 'snooze', title: 'Snooze 30m 💤' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'drank') {
    // Notify open clients to log water
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({ type: 'LOG_WATER_ACTION', amountMl: 250 });
          clientList[0].focus();
        } else {
          self.clients.openWindow('/dashboard?action=drank');
        }
      })
    );
  } else if (event.action === 'snooze') {
    // Snooze notification
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({ type: 'SNOOZE_REMINDER_ACTION' });
        }
      })
    );
  } else {
    // Open application
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/dashboard');
        }
      })
    );
  }
});
