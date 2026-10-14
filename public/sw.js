// Service worker for the admin app (/admin): shows booking alerts sent by /api/book.

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'PlayTime Rentals', {
      body: data.body,
      tag: data.tag,
      icon: '/icons/admin-192.png',
      badge: '/icons/admin-192.png',
      data: { url: '/admin' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).pathname.startsWith('/admin'));
      return open ? open.focus() : self.clients.openWindow(event.notification.data.url);
    }),
  );
});
