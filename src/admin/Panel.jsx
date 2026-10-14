import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { Sun, Inbox, CalendarDays, IndianRupee, Tag, LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { auth } from './firebase';
import { useBlocks, useBookings, useExpenses, usePricing } from './data';
import NotifyButton from './NotifyButton';
import TodayTab from './TodayTab';
import BookingsTab from './BookingsTab';
import CalendarTab from './CalendarTab';
import RevenueTab from './RevenueTab';
import PricesTab from './PricesTab';

const TABS = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'bookings', label: 'Bookings', icon: Inbox },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'revenue', label: 'Revenue', icon: IndianRupee },
  { id: 'prices', label: 'Prices', icon: Tag },
];

export default function Panel() {
  const [tab, setTab] = useState('today');
  const bookings = useBookings();
  const blocks = useBlocks();
  const expenses = useExpenses();
  const pricing = usePricing();

  const error = bookings.error || blocks.error || expenses.error || pricing.error;
  const ready = bookings.data && blocks.data && expenses.data && pricing.data;
  const pendingCount = bookings.data?.filter(b => b.status === 'pending').length ?? 0;

  const open = (id) => {
    setTab(id);
    window.scrollTo(0, 0);
  };

  const data = { bookings: bookings.data, blocks: blocks.data, expenses: expenses.data, pricing: pricing.data };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
            <span className="font-bold text-sm tracking-[0.1em] uppercase">PlayTime <span className="text-accent">Admin</span></span>
          </div>
          <div className="flex items-center gap-1">
            <NotifyButton />
            <ThemeToggle />
            <button
              onClick={() => window.confirm('Sign out?') && signOut(auth)}
              aria-label="Sign out"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {error ? (
          <p className="text-sm text-muted border border-border p-6">Couldn't load data: {error.message}</p>
        ) : !ready ? (
          <p className="text-[10px] font-bold text-muted tracking-widest uppercase animate-pulse">Loading…</p>
        ) : (
          <>
            {tab === 'today' && <TodayTab {...data} onOpen={open} />}
            {tab === 'bookings' && <BookingsTab {...data} />}
            {tab === 'calendar' && <CalendarTab {...data} />}
            {tab === 'revenue' && <RevenueTab {...data} />}
            {tab === 'prices' && <PricesTab {...data} />}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => open(id)}
              className={`relative flex flex-col items-center gap-1 pt-3 pb-2 text-[9px] font-bold tracking-widest uppercase transition-colors ${tab === id ? 'text-accent' : 'text-muted hover:text-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              {label}
              {id === 'bookings' && pendingCount > 0 && (
                <span className="absolute top-2 left-1/2 ml-2 min-w-4 h-4 px-1 bg-accent text-white text-[9px] leading-4 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
