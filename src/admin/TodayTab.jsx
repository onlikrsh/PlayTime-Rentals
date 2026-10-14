import { addDays, formatINR } from '../lib/booking';
import BookingCard from './BookingCard';
import { fmtDay, isBooked, plural, sum, todayISO } from './format';
import { Empty, PageTitle, Section, Stat } from './ui';

const byStart = (a, b) => a.start.localeCompare(b.start);
const byEnd = (a, b) => a.end.localeCompare(b.end);

export default function TodayTab({ bookings, blocks, onOpen }) {
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

  return (
    <>
      <PageTitle kicker={fmtDay(today)} title="Today" />

      {pending.length > 0 && (
        <button
          onClick={() => onOpen('bookings')}
          className="w-full bg-accent hover:bg-accent-hover text-white p-5 mb-8 flex justify-between items-center transition-colors"
        >
          <span className="font-bold uppercase tracking-wider">{plural(pending.length, 'new request')}</span>
          <span className="text-xs font-bold tracking-widest">REVIEW →</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 mb-10">
        <Stat
          label="Console"
          value={out ? 'Out' : 'Home'}
          sub={out ? `${out.name.split(' ')[0]} · back ${fmtDay(out.end)}` : 'Ready to rent'}
        />
        <Stat label="This month" value={formatINR(monthRevenue)} sub="View revenue →" onClick={() => onOpen('revenue')} />
      </div>

      <Section title="Deliver · 10:00 AM">
        {deliveries.length ? deliveries.map(b => <BookingCard key={b.id} booking={b} blocks={blocks} />) : <Empty>No deliveries today</Empty>}
      </Section>

      <Section title="Pick up · 10 AM – 12 PM">
        {pickups.length ? pickups.map(b => <BookingCard key={b.id} booking={b} blocks={blocks} />) : <Empty>No pickups today</Empty>}
      </Section>

      <Section title="Tomorrow">
        {upNext.length ? upNext.map(b => <BookingCard key={b.id} booking={b} blocks={blocks} />) : <Empty>Nothing scheduled</Empty>}
      </Section>
    </>
  );
}
