import { useState } from 'react';
import { Search } from 'lucide-react';
import BookingCard from './BookingCard';
import { Empty, PageTitle, inputClass } from './ui';

const FILTERS = [
  { id: 'new', label: 'New', match: b => b.status === 'pending', sort: () => 0 },
  { id: 'upcoming', label: 'Upcoming', match: b => b.status === 'confirmed', sort: (a, b) => a.start.localeCompare(b.start) },
  { id: 'out', label: 'Out', match: b => b.status === 'delivered', sort: (a, b) => a.end.localeCompare(b.end) },
  { id: 'past', label: 'Past', match: b => b.status === 'returned' || b.status === 'cancelled', sort: (a, b) => b.start.localeCompare(a.start) },
];

export default function BookingsTab({ bookings, blocks }) {
  const [filterId, setFilterId] = useState('new');
  const [search, setSearch] = useState('');

  const filter = FILTERS.find(f => f.id === filterId);
  const term = search.trim().toLowerCase();
  const list = bookings
    .filter(filter.match)
    .filter(b => !term || [b.name, b.phone, b.ref, b.area].some(field => field?.toLowerCase().includes(term)))
    .sort(filter.sort);

  return (
    <>
      <PageTitle kicker="Manage" title="Bookings" />

      <div className="grid grid-cols-4 border border-border mb-4">
        {FILTERS.map(f => {
          const count = bookings.filter(f.match).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilterId(f.id)}
              className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${filterId === f.id ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`}
            >
              {f.label}{f.id !== 'past' && count > 0 && ` · ${count}`}
            </button>
          );
        })}
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, booking ID"
          className={`${inputClass} pl-11`}
        />
      </div>

      <div className="space-y-3">
        {list.length ? list.map(b => <BookingCard key={b.id} booking={b} blocks={blocks} />) : <Empty>No bookings here</Empty>}
      </div>
    </>
  );
}
