import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Sun, Inbox, CalendarDays, IndianRupee, Tag, LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { auth } from './firebase';
import { useBlocks, useBookings, useExpenses, usePricing } from './data';
import { ask } from './dialogs';
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

// A notification opens /admin?booking=<id>; that booking is shown first.
const bookingFromUrl = () => new URLSearchParams(window.location.search).get('booking');

export default function Panel() {
  const [focusId, setFocusId] = useState(bookingFromUrl);
  const [tab, setTab] = useState(() => (bookingFromUrl() ? 'bookings' : 'today'));
  const bookings = useBookings();
  const blocks = useBlocks();
  const expenses = useExpenses();
  const pricing = usePricing();

  const error = bookings.error || blocks.error || expenses.error || pricing.error;
  const ready = bookings.data && blocks.data && expenses.data && pricing.data;
  const pendingCount = bookings.data?.filter(b => b.status === 'pending').length ?? 0;

  // Tapping a notification while the app is already open: jump to that booking.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessage = (event) => {
      if (event.data?.type !== 'open') return;
      const id = new URL(event.data.url, window.location.origin).searchParams.get('booking');
      setFocusId(id);
      setTab(id ? 'bookings' : 'today');
      window.scrollTo(0, 0);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);

  // Tidy the address bar once the booking from a notification has been shown.
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', '/admin');
  }, []);

  // Red badge on the PT Admin Home Screen icon = new requests waiting (iPhone iOS 16.4+, Android).
  useEffect(() => {
    if (!bookings.data || !('setAppBadge' in navigator)) return;
    (pendingCount > 0 ? navigator.setAppBadge(pendingCount) : navigator.clearAppBadge()).catch(() => {});
  }, [pendingCount, bookings.data]);

  const open = (id) => {
    setTab(id);
    setFocusId(null);
    window.scrollTo(0, 0);
  };

  const data = { bookings: bookings.data, blocks: blocks.data, expenses: expenses.data, pricing: pricing.data };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-40 bg-background border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto safe-x h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="" className="w-6 h-6 object-contain shrink-0" />
            <span className="font-bold text-sm tracking-[0.1em] uppercase truncate">PlayTime <span className="text-accent">Admin</span></span>
          </div>
          <div className="flex items-center shrink-0">
            <NotifyButton />
            <ThemeToggle />
            <button
              onClick={async () => (await ask('Sign out of PT Admin?', { confirmLabel: 'Sign out' })) && signOut(auth)}
              aria-label="Sign out"
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto safe-x pt-6 sm:pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {error ? (
          <p className="text-sm text-muted border border-border p-6">Couldn't load data: {error.message}</p>
        ) : !ready ? (
          <p className="text-[10px] font-bold text-muted tracking-widest uppercase animate-pulse">Loading…</p>
        ) : (
          <>
            {tab === 'today' && <TodayTab {...data} onOpen={open} />}
            {tab === 'bookings' && <BookingsTab key={focusId ?? 'list'} {...data} focusId={focusId} />}
            {tab === 'calendar' && <CalendarTab {...data} />}
            {tab === 'revenue' && <RevenueTab {...data} />}
            {tab === 'prices' && <PricesTab {...data} />}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto safe-x grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => open(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`relative h-14 flex flex-col items-center justify-center gap-1 text-[9px] leading-none font-bold tracking-wider sm:tracking-widest uppercase transition-colors ${tab === id ? 'text-accent' : 'text-muted hover:text-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              {label}
              {id === 'bookings' && pendingCount > 0 && (
                <span className="absolute top-1.5 left-1/2 ml-2 min-w-4 h-4 px-1 bg-accent text-white text-[9px] leading-4 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
