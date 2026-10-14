// ═══════════════════════════════════════════════════════════════════════
//  npm run demo: try the website and admin app on your computer.
//
//  1. Starts a private copy of Firebase on your computer (your real
//     database is never touched)
//  2. Fills it with sample bookings, prices and expenses
//  3. Creates a demo admin login (printed below when it starts)
//  4. Starts the website and opens it in your browser
//
//  Press Ctrl+C to stop. Everything is wiped when it stops, so you can
//  click around freely.
// ═══════════════════════════════════════════════════════════════════════

import { spawn, spawnSync } from 'node:child_process';
import webpush from 'web-push';

const PROJECT = 'demo-playtime'; // "demo-" projects only ever exist on your computer
const DEMO_LOGIN = { email: 'admin@demo.test', password: 'playtime-demo' };
const onWindows = process.platform === 'win32';

// The website and backend talk to the local copy instead of the real Firebase.
const localFirebase = {
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  VITE_USE_EMULATORS: 'true',
  VITE_FIREBASE_PROJECT_ID: PROJECT,
  VITE_FIREBASE_API_KEY: 'demo-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'localhost',
  VITE_FIREBASE_APP_ID: 'demo',
};
Object.assign(process.env, localFirebase);

// ─── 1. Java check (the local Firebase database needs it) ───────────────
if (spawnSync('java', ['-version']).error) {
  console.log(`
  Java is needed for the local test database. Install it once, then run "npm run demo" again:

    Arch Linux:     sudo pacman -S jre-openjdk
    Ubuntu/Debian:  sudo apt install openjdk-21-jre
    Mac:            brew install openjdk
    Windows:        https://adoptium.net (Temurin 21 or newer)
`);
  process.exit(1);
}

// ─── 2. Start the local Firebase ────────────────────────────────────────
console.log('\n  Starting the local test database… (the first time takes a few minutes)\n');
const firebase = spawn(
  'npx', ['-y', 'firebase-tools@15', 'emulators:start', '--only', 'auth,firestore', '--project', PROJECT],
  { shell: onWindows, stdio: ['ignore', 'pipe', 'pipe'] },
);
let firebaseLog = '';
firebase.stdout.on('data', (d) => { firebaseLog += d; });
firebase.stderr.on('data', (d) => { firebaseLog += d; });

let vite;
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  console.log('\n  Stopping the demo…');
  vite?.kill();
  firebase.kill('SIGINT');
  setTimeout(() => process.exit(code), 5000).unref(); // in case it doesn't stop by itself
}
process.on('SIGINT', () => stop(0));
firebase.on('exit', () => {
  if (stopping) process.exit(0);
  console.log('  The local test database stopped unexpectedly. Details:\n\n' + firebaseLog.slice(-2000));
  vite?.kill();
  process.exit(1);
});

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Timed out starting the local database.')), 10 * 60 * 1000);
  const check = setInterval(() => {
    if (firebaseLog.includes('All emulators ready')) {
      clearInterval(check);
      clearTimeout(timer);
      resolve();
    }
  }, 300);
}).catch((err) => {
  console.log(`  ${err.message}\n\n${firebaseLog.slice(-2000)}`);
  stop(1);
});

// ─── 3. Fill it with sample data ────────────────────────────────────────
const { initializeApp } = await import('firebase-admin/app');
const { getFirestore, Timestamp } = await import('firebase-admin/firestore');
const { getAuth } = await import('firebase-admin/auth');
const { addDays, makeRef, quote, rentalEnd, todayIST } = await import('../src/lib/booking.js');
const { defaultPricing } = await import('../src/config/pricing.js');

const app = initializeApp({ projectId: PROJECT });
const db = getFirestore(app);
const admin = await getAuth(app).createUser({ ...DEMO_LOGIN, displayName: 'Demo admin' });
await db.doc(`admins/${admin.uid}`).set({ email: DEMO_LOGIN.email });

const today = todayIST();
const day = (offset) => addDays(today, offset);
const sampleBookings = [
  // name, phone, area, start, days, extra controller, status, paid
  ['Arjun Varma', '9848012345', 'Gajuwaka', day(-3), 3, true, 'delivered', false],   // pickup today
  ['Sneha Reddy', '9701234567', 'Madhurawada', day(1), 2, false, 'confirmed', false], // delivery tomorrow
  ['Ravi Kumar', '9876543210', 'MVP Colony', day(5), 3, true, 'pending', false],      // new request
  ['Kiran Teja', '9912345678', 'Rushikonda', day(-12), 7, true, 'returned', true],
  ['Priya Sharma', '9123456780', 'Seethammadhara', day(-25), 2, false, 'returned', false],
  ['Manoj Rao', '9000012345', 'PM Palem', day(10), 1, false, 'cancelled', false],
];
for (const [name, phone, area, start, days, extraController, status, paid] of sampleBookings) {
  const end = rentalEnd(start, days);
  // Booked 2 days before the start, or an hour ago for new and upcoming ones
  const bookedOn = status === 'pending' || addDays(start, -2) >= today ? null : addDays(start, -2);
  const createdAt = bookedOn ? new Date(`${bookedOn}T09:30:00+05:30`) : new Date(Date.now() - 60 * 60 * 1000);
  const doc = await db.collection('bookings').add({
    ref: makeRef(), name, phone, area, start, end, days, extraController, sms: false,
    total: quote(defaultPricing, days, extraController).total, paid, status, source: 'web',
    createdAt: Timestamp.fromDate(createdAt),
  });
  if (status === 'confirmed' || status === 'delivered') {
    await db.doc(`blocks/${doc.id}`).set({ start, end, bookingId: doc.id });
  }
}
await db.collection('blocks').add({ start: day(14), end: day(15), note: 'Console servicing' });
await db.collection('expenses').add({ date: day(-9), label: 'PS Plus Deluxe', amount: 1199 });
await db.collection('expenses').add({ date: day(-3), label: 'Delivery fuel', amount: 400 });

// ─── 4. Start the website ───────────────────────────────────────────────
const keys = webpush.generateVAPIDKeys(); // fresh notification keys for this demo
vite = spawn('npx', ['vite', '--open'], {
  shell: onWindows,
  stdio: ['inherit', 'pipe', 'inherit'],
  env: {
    ...process.env,
    VITE_VAPID_PUBLIC_KEY: keys.publicKey,
    VAPID_PRIVATE_KEY: keys.privateKey,
    VAPID_SUBJECT: 'mailto:demo@playtime.test',
  },
});
let announced = false;
vite.stdout.on('data', (data) => {
  const text = data.toString();
  // eslint-disable-next-line no-control-regex -- strips terminal colour codes from Vite's output
  const url = text.replace(/\x1b\[[0-9;]*m/g, '').match(/Local:\s+(http:\/\/\S+?)\/?\s/)?.[1];
  if (url && !announced) {
    announced = true;
    console.log(`
  ┌──────────────────────────────────────────────────────────┐
     PlayTime Rentals demo is running

     Website:      ${url}
     Admin app:    ${url}/admin

     Admin login   email:     ${DEMO_LOGIN.email}
                   password:  ${DEMO_LOGIN.password}

     Sample bookings are loaded. Nothing here is real.
     Press Ctrl+C to stop (everything resets).
  └──────────────────────────────────────────────────────────┘
`);
  } else if (announced) {
    process.stdout.write(text);
  }
});
vite.on('exit', () => stop(0));
