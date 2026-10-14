import { DEFAULT_TIME, addDays, formatINR, formatTime } from '../lib/booking';
import BookingCard from './BookingCard';
import { fmtDay, isBooked, plural, sum, todayISO } from './format';
import { Empty, PageTitle, Section, Stat } from './ui';

// Earliest first: by date, then by time on that date
const byStart = (a, b) => `${a.start} ${a.startTime || DEFAULT_TIME}`.localeCompare(`${b.start} ${b.startTime || DEFAULT_TIME}`);
const byEnd = (a, b) => `${a.end} ${a.endTime || DEFAULT_TIME}`.localeCompare(`${b.end} ${b.endTime || DEFAULT_TIME}`);

export default function TodayTab({ bookings, blocks, pricing, onOpen }) {
  const today = todayISO();
  const tomorrow = addDays(today, 1);

  const pending = bookings.filter(b => b.status === 'pending');
  // Anything overdue stays here until it's marked done.
  const deliveries = bookings.filter(b => b.status === 'confirmed' && b.start <= today).sort(byStart);
  const pickups = bookings.filter(b => b.status === 'delivered' && b.end <= today).sort(byEnd);
  const upNext = bookings
    .filter(b => (b.status === 'confirmed' && b.start === tomorrow) || (b.status === 'delivered' && b.end === tomorrow))
    .sort(byStart);

  const out = bookings.find(b => b.status === 'delivered');
  const month = today.slice(0, 7);
  const monthRevenue = sum(bookings.filter(b => isBooked(b) && b.start.startsWith(month)), 'total');
  const card = (b) => <BookingCard key={b.id} booking={b} blocks={blocks} pricing={pricing} />;

  return (
    <>
      <PageTitle kicker={fmtDay(today)} title="Today" />

      {pending.length > 0 && (
        <button
          onClick={() => onOpen('bookings')}
          className="w-full bg-accent hover:bg-accent-hover text-white p-4 sm:p-5 mb-8 flex justify-between items-center gap-3 transition-colors"
        >
          <span className="font-bold uppercase tracking-wider text-left">{plural(pending.length, 'new request')}</span>
          <span className="text-xs font-bold tracking-widest shrink-0">REVIEW →</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 mb-10">
        <Stat
          label="Console"
          value={out ? 'Out' : 'Home'}
          sub={out ? `${out.name.split(' ')[0]} · back ${fmtDay(out.end)}, ${formatTime(out.endTime)}` : 'Ready to rent'}
        />
        <Stat label="This month" value={formatINR(monthRevenue)} sub="View revenue →" onClick={() => onOpen('revenue')} />
      </div>

      <Section title="Deliver today">
        {deliveries.length ? deliveries.map(card) : <Empty>No deliveries today</Empty>}
      </Section>

      <Section title="Pick up today">
        {pickups.length ? pickups.map(card) : <Empty>No pickups today</Empty>}
      </Section>

      <Section title="Tomorrow">
        {upNext.length ? upNext.map(card) : <Empty>Nothing scheduled</Empty>}
      </Section>
    </>
  );
}
