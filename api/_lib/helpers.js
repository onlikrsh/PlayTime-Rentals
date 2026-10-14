// ═══════════════════════════════════════════════════════════════════════
//  Shared helpers for the backend (the files in the /api folder).
//
//  You normally never need to change this file. It does four jobs:
//    1. Connects to your Firebase database
//    2. Reads your current prices
//    3. Sends notifications to your phone
//    4. Small utilities for reading requests and sending answers
//
//  (Files inside api/_lib are helpers only; they are not web addresses.)
// ═══════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import webpush from 'web-push';
import { withDefaults } from '../../src/config/pricing.js';


// ─── 1. Connect to the database ─────────────────────────────────────────
// Uses the secret key you pasted into Vercel as FIREBASE_SERVICE_ACCOUNT.

function connect() {
  if (getApps().length > 0) return getApps()[0]; // already connected

  // When testing on your computer with the Firebase emulator, no key is needed.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID });
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing. Add it in Vercel → Settings → Environment Variables.');
  }
  return initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}

const app = connect();
export const database = getFirestore(app);
const logins = getAuth(app);


// ─── 2. Prices ──────────────────────────────────────────────────────────
// Prices saved in the admin app (Prices tab). If none are saved yet,
// the defaults in src/config/pricing.js are used.

export async function getPrices() {
  const saved = await database.doc('settings/pricing').get();
  return withDefaults(saved.data());
}


// ─── 3. Phone notifications ─────────────────────────────────────────────
// Sends a notification to every phone where you tapped the bell in the admin app.
// Returns { delivered: how many phones got it, problem: what's wrong with the
// notification settings, or null }. It never throws, so a notification problem
// can't make a booking fail.

// Checks the three VAPID settings from Vercel. Returns a problem description, or null if they're fine.
function setUpNotifications() {
  const publicKey = (process.env.VITE_VAPID_PUBLIC_KEY || '').trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
  const subject = (process.env.VAPID_SUBJECT || '').trim();
  if (!publicKey || !privateKey || !subject) return 'Notification settings (VAPID_…) are missing in Vercel.';
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return null;
  } catch (error) {
    return `A notification setting in Vercel is wrong: ${error.message}`;
  }
}

export async function notifyMyPhones(title, message) {
  const problem = setUpNotifications();
  if (problem) {
    console.error(problem);
    return { delivered: 0, problem };
  }

  let delivered = 0;
  try {
    const phones = await database.collection('pushSubs').get();
    for (const phone of phones.docs) {
      const { endpoint, keys } = phone.data();
      try {
        await webpush.sendNotification({ endpoint, keys }, JSON.stringify({ title, body: message }), { TTL: 86400, urgency: 'high' });
        delivered++;
      } catch (error) {
        // 404 / 410 means the app was removed from that phone, so forget it.
        if (error.statusCode === 404 || error.statusCode === 410) await phone.ref.delete();
        else console.error('Notification failed:', error.statusCode, error.body || error.message);
      }
    }
  } catch (error) {
    console.error('Notification failed:', error);
  }
  return { delivered, problem: null };
}


// ─── 4. Small utilities ─────────────────────────────────────────────────

// Send an answer back to the browser, e.g. reply(res, 200, { ok: true }).
export function reply(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Read what the browser sent us (the form details).
export async function readForm(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body; // on Vercel
  let text = '';
  for await (const piece of req) text += piece; // on your computer (npm run dev)
  return text ? JSON.parse(text) : {};
}

// Is this request coming from you, signed in to the admin app?
export async function isAdmin(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return false;
  try {
    const user = await logins.verifyIdToken(token);
    const adminRecord = await database.doc(`admins/${user.uid}`).get();
    return adminRecord.exists;
  } catch {
    return false;
  }
}
