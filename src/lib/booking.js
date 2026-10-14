// Booking rules shared by the website, the admin panel and the /api functions,
// so keep this file free of browser-only and Node-only APIs.
//
// Dates are 'yyyy-MM-dd' strings. A rental of N days runs from 10:00 AM on `start`
// to 10:00 AM on start + N, and the console is picked up that morning, so a booking
// occupies every day from start to end inclusive.

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const rentalEnd = (start, days) => addDays(start, days);

// Customers always book 10:00 AM to 10:00 AM; the admin app can set other times.
export const DEFAULT_TIME = '10:00';

// '10:00' → '10 AM', '14:30' → '2:30 PM'
export function formatTime(time = DEFAULT_TIME) {
  const [h, m] = (time || DEFAULT_TIME).split(':').map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`;
}

export const isValidTime = (time) => typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

// Whole days from one date to another, e.g. '2026-10-20' → '2026-10-23' is 3.
export const daysBetween = (start, end) => Math.round((Date.parse(end) - Date.parse(start)) / 86400000);

export const isValidDate = (iso) =>
  typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && addDays(iso, 0) === iso;

// Today's date in India, whatever timezone the code runs in.
export const todayIST = () => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const rangesOverlap = (a, b) => a.start <= b.end && b.start <= a.end;

// First block that overlaps `range`, skipping the block with id `ignoreId` (a booking's own block).
export const findClash = (blocks, range, ignoreId) =>
  blocks.find((b) => (!ignoreId || b.id !== ignoreId) && rangesOverlap(range, b));

function tierPrice(base, discounts, days) {
  const tier = [...discounts].sort((a, b) => b.minDays - a.minDays).find((t) => days >= t.minDays);
  return tier ? tier.pricePerDay : base;
}

export function quote(pricing, days, extraController) {
  const perDay = tierPrice(pricing.basePricePerDay, pricing.discounts, days);
  const controllerPerDay = tierPrice(pricing.extraController.basePricePerDay, pricing.extraController.discounts, days);
  return { perDay, controllerPerDay, total: days * perDay + (extraController ? days * controllerPerDay : 0) };
}

// Price rows covering 1..maxDays, e.g. [{ from: 1, to: 2, pricePerDay: 1000 }, ...].
export function priceTable(base, discounts, maxDays) {
  const tiers = [
    { minDays: 1, pricePerDay: base },
    ...[...discounts].filter((t) => t.minDays > 1).sort((a, b) => a.minDays - b.minDays),
  ].filter((t) => t.minDays <= maxDays);
  return tiers.map((t, i) => ({
    from: t.minDays,
    to: i < tiers.length - 1 ? tiers[i + 1].minDays - 1 : maxDays,
    pricePerDay: t.pricePerDay,
  }));
}

// Opens the pinned spot in Google Maps (app on phones), e.g. for directions on delivery day.
export const mapsLink = ({ lat, lng }) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// "98765 43210", "+91 98765-43210", "098765 43210" → "9876543210"; null if not an Indian mobile number.
export function normalizePhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

// Short booking ID like "PT-7K3QX" (no 0/O/1/I/L so it reads cleanly over WhatsApp).
const REF_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function makeRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return 'PT-' + Array.from(bytes, (b) => REF_CHARS[b % REF_CHARS.length]).join('');
}
