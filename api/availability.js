// ═══════════════════════════════════════════════════════════════════════
//  /api/availability: runs every time someone opens the website.
//
//  Sends the website two things:
//    • your current prices
//    • which dates are taken (so the calendar can grey them out)
//
//  Only dates are sent. Customer names and phone numbers never leave the admin app.
// ═══════════════════════════════════════════════════════════════════════

import { database, getPrices, reply } from './_lib/helpers.js';
import { todayIST } from '../src/lib/booking.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return reply(res, 405, { error: 'Not allowed' });

  try {
    const prices = await getPrices();
    const takenDates = await database.collection('blocks').where('end', '>=', todayIST()).get();

    // Allow Vercel to reuse this answer for 15 seconds so the site stays fast.
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return reply(res, 200, {
      pricing: prices,
      blocks: takenDates.docs.map((d) => ({ start: d.get('start'), end: d.get('end') })),
    });
  } catch (error) {
    console.error(error);
    return reply(res, 500, { error: 'Could not load availability' });
  }
}
