// ═══════════════════════════════════════════════════════════════════════
//  /api/morning: Vercel runs this once every morning (see "crons" in vercel.json).
//
//  Step 1. Make sure it's really Vercel's daily timer calling
//  Step 2. Find today's deliveries, pickups and waiting requests
//  Step 3. If there's anything to do, send one summary to your phone
// ═══════════════════════════════════════════════════════════════════════

import { database, notifyMyPhones, reply } from './_lib/helpers.js';
import { DEFAULT_TIME, formatTime, todayIST } from '../src/lib/booking.js';

export default async function handler(req, res) {
  // Step 1. With CRON_SECRET set in Vercel, only Vercel's timer knows the password.
  const secret = process.env.CRON_SECRET;
  const fromVercelTimer = secret
    ? req.headers.authorization === `Bearer ${secret}`
    : String(req.headers['user-agent'] || '').startsWith('vercel-cron');
  if (!fromVercelTimer) return reply(res, 401, { error: 'Not allowed' });

  try {
    // Step 2. What's on today?
    const today = todayIST();
    const snapshot = await database.collection('bookings').where('status', 'in', ['pending', 'confirmed', 'delivered']).get();
    const bookings = snapshot.docs.map((d) => d.data());
    const byTime = (field) => (a, b) => (a[field] || DEFAULT_TIME).localeCompare(b[field] || DEFAULT_TIME);
    const firstName = (b) => b.name.split(' ')[0];

    const deliveries = bookings.filter((b) => b.status === 'confirmed' && b.start <= today).sort(byTime('startTime'));
    const pickups = bookings.filter((b) => b.status === 'delivered' && b.end <= today).sort(byTime('endTime'));
    const waiting = bookings.filter((b) => b.status === 'pending').length;

    const lines = [
      ...deliveries.map((b) => `🚚 ${formatTime(b.startTime)} deliver to ${firstName(b)}, ${b.area}${b.start < today ? ' (late)' : ''}`),
      ...pickups.map((b) => `📦 ${formatTime(b.endTime)} pick up from ${firstName(b)}, ${b.area}${b.end < today ? ' (late)' : ''}`),
      ...(waiting ? [`🆕 ${waiting} new request${waiting > 1 ? 's' : ''} waiting`] : []),
    ];

    // Step 3. Only notify when there's something to do.
    if (lines.length === 0) return reply(res, 200, { sent: 0, reason: 'Nothing on today' });
    const { delivered } = await notifyMyPhones('☀️ Today at PlayTime', lines.join('\n'), { badge: waiting, tag: `morning-${today}` });
    return reply(res, 200, { sent: delivered });
  } catch (error) {
    console.error(error);
    return reply(res, 500, { error: 'Morning summary failed' });
  }
}
