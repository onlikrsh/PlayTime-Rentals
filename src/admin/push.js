// Push notifications for the admin app. On iPhone they work once the app has been
// added to the Home Screen (iOS 16.4+); /sw.js shows them.
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export const registerWorker = () => navigator.serviceWorker.register('/sw.js', { scope: '/admin' });

function base64UrlToBytes(base64Url) {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function sha256(text) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Call straight from a tap: iOS only shows the permission prompt in response to one.
export async function enablePush() {
  if (!VAPID_PUBLIC_KEY) throw new Error('Push is not set up yet (VITE_VAPID_PUBLIC_KEY is missing).');
  if ((await Notification.requestPermission()) !== 'granted') {
    throw new Error('Notifications are turned off for this app. Allow them in your phone settings, then try again.');
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
  });
  const { endpoint, keys } = subscription.toJSON();
  await setDoc(doc(db, 'pushSubs', await sha256(endpoint)), {
    endpoint, keys, device: navigator.userAgent.slice(0, 150), createdAt: serverTimestamp(),
  });
}

export async function sendTestPush() {
  const res = await fetch('/api/test-push', {
    method: 'POST',
    headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not send a test notification.');
  return data.sent;
}
