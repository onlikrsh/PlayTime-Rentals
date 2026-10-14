import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';

export const toISO = (date) => format(date, 'yyyy-MM-dd');
export const todayISO = () => toISO(new Date());

export const fmtDay = (iso) => format(parseISO(iso), 'EEE d MMM');
export const fmtShort = (iso) => format(parseISO(iso), 'd MMM');
export const fmtPhone = (phone = '') => `${phone.slice(0, 5)} ${phone.slice(5)}`.trim();
export const timeAgo = (timestamp) =>
  timestamp ? formatDistanceToNowStrict(timestamp.toDate(), { addSuffix: true }) : 'just now';

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
export const sum = (rows, field) => rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);

// Bookings that count as income (not pending requests or cancellations).
export const isBooked = (booking) => ['confirmed', 'delivered', 'returned'].includes(booking.status);
