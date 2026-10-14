// Service worker for the admin app (/admin): shows notifications sent by the backend,
// keeps the badge on the PT Admin icon up to date, and opens the right booking when tapped.

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const jobs = [
    self.registration.showNotification(data.title || 'PT Admin', {
      body: data.body,
      tag: data.tag,
      icon: '/icons/admin-192.png',
      badge: '/icons/admin-192.png',
      timestamp: Date.now(),
      data: { url: data.url || '/admin' },
    }),
  ];
  // Red number on the Home Screen icon = new requests waiting (iPhone iOS 16.4+, Android)
  if (typeof data.badge === 'number' && 'setAppBadge' in self.navigator) {
    jobs.push(data.badge > 0 ? self.navigator.setAppBadge(data.badge) : self.navigator.clearAppBadge());
  }
  event.waitUntil(Promise.all(jobs).catch(() => {}));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const app = windows.find((w) => new URL(w.url).pathname.startsWith('/admin'));
    if (app) {
      await app.focus();
      app.postMessage({ type: 'open', url }); // the open app jumps to that booking
      return;
    }
    await self.clients.openWindow(url);
  })());
});
