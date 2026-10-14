// ═══════════════════════════════════════════════════════════════════════
//  /api/test-push: the "Send a test notification?" option on the bell
//  in the admin app. Only works when you're signed in as admin.
// ═══════════════════════════════════════════════════════════════════════

import { isAdmin, notifyMyPhones, reply } from './_lib/helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Not allowed' });
  if (!(await isAdmin(req))) return reply(res, 401, { error: 'Please sign in as admin.' });

  const delivered = await notifyMyPhones('PlayTime Admin', 'Notifications are working 🎮');
  if (delivered === null) return reply(res, 500, { error: 'Notification keys (VAPID_…) are not set in Vercel yet.' });
  return reply(res, 200, { sent: delivered });
}
