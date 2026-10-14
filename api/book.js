// ═══════════════════════════════════════════════════════════════════════
//  /api/book: runs when a customer taps "REQUEST BOOKING" on the website.
//
//  Step 1. Read the customer's details from the form (and their map pin, if any)
//  Step 2. Check the details make sense
//  Step 3. Check the console is free on those dates
//  Step 4. Work out the price (done here so nobody can change it in their browser)
//  Step 5. Save the booking as a new request ("pending")
//  Step 6. Send a notification to your phone
//  Step 7. Tell the website it worked (it then shows the booking ID)
// ═══════════════════════════════════════════════════════════════════════

import { FieldValue } from 'firebase-admin/firestore';
import { countNewRequests, database, getPrices, notifyMyPhones, readForm, reply } from './_lib/helpers.js';
import { DEFAULT_TIME, findClash, formatINR, formatTime, isValidDate, makeRef, normalizePhone, quote, rentalEnd, todayIST } from '../src/lib/booking.js';

// A map pin from the booking form, rounded to about 10 cm. Anything else counts as "not pinned".
function pinnedLocation(pin) {
  const lat = Number(pin?.lat);
  const lng = Number(pin?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Not allowed' });

  try {
    // Step 1. Read the form
    const form = await readForm(req);
    const name = String(form.name || '').trim().slice(0, 60);
    const area = String(form.area || '').trim().slice(0, 150);
    const location = pinnedLocation(form.location); // { lat, lng } or null if not pinned
    const phone = normalizePhone(form.phone); // "+91 98765-43210" → "9876543210"
    const start = form.start;                 // e.g. "2026-10-20"
    const days = Number(form.days);
    const extraController = form.extraController === true;
    const sms = form.sms === true;
    const prices = await getPrices();

    // Step 2. Check the details (these messages are shown to the customer)
    if (name.length < 2) return reply(res, 400, { error: 'Please enter your name.' });
    if (!phone) return reply(res, 400, { error: 'Please enter a valid 10-digit mobile number.' });
    if (area.length < 2) return reply(res, 400, { error: 'Please enter your area in Vizag.' });
    if (!isValidDate(start) || start < todayIST()) return reply(res, 400, { error: 'Please pick a valid start date.' });
    if (!Number.isInteger(days) || days < 1 || days > prices.maxDays) {
      return reply(res, 400, { error: `Rentals can be 1 to ${prices.maxDays} days.` });
    }

    // Step 3. Is the console free? (the end day is pickup day, so it counts too)
    const end = rentalEnd(start, days);
    const takenDates = await database.collection('blocks').where('end', '>=', start).get();
    if (findClash(takenDates.docs.map((d) => d.data()), { start, end })) {
      return reply(res, 409, { error: 'Sorry, those dates were just booked. Please pick another start date.' });
    }

    // Step 4. Price
    const total = quote(prices, days, extraController).total;

    // Step 5. Save it
    const ref = makeRef(); // short booking ID like "PT-7K3QX"
    const saved = await database.collection('bookings').add({
      ref, name, phone, area, location, start, end, days, extraController, sms, total,
      startTime: DEFAULT_TIME, // customers always book 10 AM to 10 AM; you can change it in the admin app
      endTime: DEFAULT_TIME,
      status: 'pending',
      paid: false,
      source: 'web',
      createdAt: FieldValue.serverTimestamp(),
    });

    // Step 6. Notify your phone (tapping it opens this booking in the admin app)
    const day = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(',', '');
    await notifyMyPhones(
      `🎮 New booking request · ${formatINR(total)}`,
      `${name} · ${area}\n${day(start)}, ${formatTime(DEFAULT_TIME)} → ${day(end)} · ${days} day${days > 1 ? 's' : ''}` +
        `${extraController ? ' · extra controller' : ''}${location ? '\n📍 Location pinned' : ''}`,
      { url: `/admin?booking=${saved.id}`, badge: await countNewRequests().catch(() => undefined), tag: ref },
    );

    // Step 7. Done
    return reply(res, 200, { ref, start, end, days, extraController, sms, total });
  } catch (error) {
    console.error(error);
    return reply(res, 500, { error: 'Could not save your booking. Please message us on WhatsApp.' });
  }
}
