import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, MessageCircle, Check } from 'lucide-react';
import { formatINR, rentalEnd } from '../lib/booking';
import { whatsappLink, AREAS } from '../config/site';

const inputClass = "w-full bg-background border border-border px-4 py-3 text-sm font-medium focus:outline-none focus:border-accent transition-colors";
const labelClass = "block text-[10px] font-bold text-muted tracking-widest uppercase mb-2";

function bookingMessage({ ref, name, area, start, days, extraController, sms, total }) {
  const addons = [extraController && "Extra Controller", sms && "SMS Notifications"].filter(Boolean);
  const day = (iso) => format(parseISO(iso), 'MMM do, yyyy');
  return (
    `Hi PlayTime Rentals,\nI'd like to book a PS5 console!\n\n` +
    (ref ? `🔖 *Booking ID:* ${ref}\n` : '') +
    `👤 *Name:* ${name}\n` +
    `📍 *Area:* ${area}\n` +
    `📅 *Duration:* ${days} Day${days > 1 ? 's' : ''}\n` +
    `⏳ *From:* ${day(start)} at 10:00 AM\n` +
    `⏳ *To:* ${day(rentalEnd(start, days))} at 10:00 AM\n` +
    `🎮 *Add-ons:* ${addons.length > 0 ? addons.join(', ') : 'None'}\n` +
    `💰 *Grand Total:* ${formatINR(total)}\n\n` +
    `Is this available for delivery?`
  );
}

// Step 03: collects contact details, saves the request, then hands off to WhatsApp.
export default function BookingForm({ start, config, onClose, onBooked }) {
  const [details, setDetails] = useState({ name: '', phone: '', area: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | failed
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const request = {
    ...details,
    start: format(start, 'yyyy-MM-dd'),
    days: config.duration,
    extraController: config.extraController,
    sms: config.smsNotifications,
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = (field) => (e) => setDetails({ ...details, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(20);
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBooking(data);
        setStatus('done');
        onBooked();
      } else if (res.status === 400 || res.status === 409) {
        // Something the customer can fix (bad phone number, dates just taken)
        setError(data.error);
        setStatus('idle');
        if (res.status === 409) onBooked();
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass w-full sm:max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-form-title"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-6 right-6 p-1 text-muted hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        {status === 'done' ? (
          <div>
            <div className="w-12 h-12 bg-accent text-white flex items-center justify-center mb-6">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">REQUEST SENT</p>
            <h2 id="booking-form-title" className="text-2xl font-bold tracking-tight uppercase mb-2">Booking {booking.ref}</h2>
            <p className="text-sm text-muted mb-8">
              We've received your request for {booking.days} day{booking.days > 1 ? 's' : ''} from {format(parseISO(booking.start), 'MMM dd')} ({formatINR(booking.total)}). Send it on WhatsApp and we'll confirm your delivery.
            </p>
            <a
              href={whatsappLink(bookingMessage({ ...request, ...booking }))}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 font-bold tracking-wider transition-colors uppercase flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> SEND ON WHATSAPP
            </a>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">STEP 03</p>
            <h2 id="booking-form-title" className="text-2xl font-bold tracking-tight uppercase mb-2">Your Details</h2>
            <p className="text-sm text-muted mb-8">
              {format(start, 'MMM dd')} · {config.duration} day{config.duration > 1 ? 's' : ''} · {formatINR(config.totalPrice)}
            </p>

            <div className="space-y-5 mb-8">
              <div>
                <label htmlFor="bf-name" className={labelClass}>Name</label>
                <input id="bf-name" required autoComplete="name" value={details.name} onChange={update('name')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bf-phone" className={labelClass}>Mobile number</label>
                <input id="bf-phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={details.phone} onChange={update('phone')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="bf-area" className={labelClass}>Area in Vizag</label>
                <input id="bf-area" required list="bf-areas" placeholder="e.g. MVP Colony" value={details.area} onChange={update('area')} className={inputClass} />
                <datalist id="bf-areas">
                  {AREAS.map(area => <option key={area} value={area} />)}
                </datalist>
              </div>
            </div>

            {error && <p className="text-sm text-accent font-medium mb-4">{error}</p>}

            {status === 'failed' && (
              <div className="border border-border p-4 mb-4">
                <p className="text-sm text-muted mb-3">We couldn't save your request right now. You can still book directly on WhatsApp.</p>
                <a
                  href={whatsappLink(bookingMessage({ ...request, total: config.totalPrice }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-accent uppercase tracking-wider"
                >
                  Book on WhatsApp →
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 font-bold tracking-wider transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? <span className="animate-pulse">PROCESSING...</span> : 'REQUEST BOOKING'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
