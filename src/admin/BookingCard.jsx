import { useEffect, useRef, useState } from 'react';
import { Phone, MessageCircle, Check, MapPin, Pencil, Trash2 } from 'lucide-react';
import { DEFAULT_TIME, findClash, formatINR, formatTime, mapsLink } from '../lib/booking';
import { deleteBooking, editBooking, setStatus, updateBooking } from './data';
import { ask, tell } from './dialogs';
import BookingEditor from './BookingEditor';
import { fmtDay, fmtPhone, fmtShort, isBooked, plural, timeAgo } from './format';
import { Button, StatusPill, inputClass } from './ui';

// Next steps offered for each status: [label, new status, confirmation question]
const ACTIONS = {
  pending: [['Decline', 'cancelled', 'Decline this booking request?'], ['Confirm', 'confirmed']],
  confirmed: [['Cancel', 'cancelled', 'Cancel this booking? Its dates open up on the website again.'], ['Delivered', 'delivered']],
  delivered: [['Returned', 'returned']],
};

const iconButton = "p-2.5 text-muted hover:text-accent transition-colors";

function customerMessage(b) {
  const first = b.name.split(' ')[0];
  if (b.status === 'confirmed') {
    return `Hi ${first}, your PS5 booking ${b.ref} is confirmed! We'll deliver on ${fmtDay(b.start)} at ${formatTime(b.startTime)}.`;
  }
  return `Hi ${first}, this is PlayTime Rentals about your booking ${b.ref}.`;
}

export default function BookingCard({ booking: b, blocks, pricing, highlight = false }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(null); // string while editing the total
  const card = useRef(null);

  // Opened from a notification: bring this booking into view.
  useEffect(() => {
    if (highlight) card.current?.scrollIntoView({ block: 'center' });
  }, [highlight]);

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      await tell(err.message);
    } finally {
      setBusy(false);
    }
  };

  const move = async (status, question) => {
    if (question && !(await ask(question, { confirmLabel: 'Yes' }))) return;
    if (status === 'confirmed') {
      const clash = findClash(blocks, b, b.id);
      if (clash) {
        await tell(`Can't confirm: ${fmtShort(b.start)} – ${fmtShort(b.end)} overlaps ${clash.bookingId ? 'another booking' : 'blocked dates'} (${fmtShort(clash.start)} – ${fmtShort(clash.end)}).`);
        return;
      }
    }
    run(() => setStatus(b, status));
  };

  const remove = async () => {
    const warning = {
      confirmed: ' Its dates will open up on the website again.',
      delivered: ' The console is still marked as out with this customer, and its dates will open up again.',
      returned: ` Its ${formatINR(b.total)} will be removed from your revenue.`,
    }[b.status] ?? '';
    if (!(await ask(`Delete booking ${b.ref} (${b.name}) permanently?${warning}\n\nThis can't be undone.`, { confirmLabel: 'Delete' }))) return;
    run(() => deleteBooking(b));
  };

  const saveAmount = () => {
    const total = Math.round(Number(amount));
    if (!(total >= 0)) return;
    run(async () => {
      await updateBooking(b.id, { total });
      setAmount(null);
    });
  };

  const addons = [b.extraController && 'Extra controller', b.sms && 'SMS'].filter(Boolean);
  const actions = ACTIONS[b.status] ?? [];

  if (editing) {
    return (
      <div className="glass p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-bold tracking-widest">EDIT {b.ref}</span>
          <StatusPill status={b.status} />
        </div>
        <BookingEditor
          initial={{
            name: b.name, phone: b.phone, area: b.area,
            start: b.start, startTime: b.startTime || DEFAULT_TIME,
            days: b.days, endTime: b.endTime || DEFAULT_TIME,
            extraController: !!b.extraController, total: b.total,
          }}
          pricing={pricing}
          blocks={blocks}
          ignoreId={b.id}
          // Only bookings holding dates on the website need to avoid overlaps
          checkClash={b.status === 'confirmed' || b.status === 'delivered'}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSave={async (changes) => {
            await editBooking(b, changes);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div ref={card} className={`glass p-4 sm:p-5 ${highlight ? 'ring-2 ring-accent' : ''}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold tracking-widest">{b.ref}</span>
          <StatusPill status={b.status} />
        </div>
        <span className="text-[10px] text-muted uppercase tracking-wider truncate">{timeAgo(b.createdAt)}</span>
      </div>

      <p className="font-bold uppercase tracking-wide break-words">{b.name}</p>
      <p className="text-sm text-muted mb-4 break-words">{b.area} · {fmtPhone(b.phone)}</p>

      <div className="flex justify-between items-end gap-3 pb-4 border-b border-border/50">
        <div className="text-sm min-w-0">
          <p className="font-medium">{fmtDay(b.start)} · {formatTime(b.startTime)}</p>
          <p className="font-medium">→ {fmtDay(b.end)} · {formatTime(b.endTime)}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider mt-1">
            {plural(b.days, 'day')}{addons.length > 0 && ` · ${addons.join(' · ')}`}
          </p>
        </div>

        <div className="text-right shrink-0">
          {amount === null ? (
            <button onClick={() => setAmount(String(b.total))} className="text-xl font-bold hover:text-accent transition-colors" title="Edit amount">
              {formatINR(b.total)}
            </button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); saveAmount(); }} className="flex gap-1">
              <input autoFocus type="number" inputMode="numeric" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} w-24 py-2 px-2 text-right`} />
              <Button type="submit" disabled={busy} className="py-2 px-3" aria-label="Save amount"><Check className="w-4 h-4" /></Button>
            </form>
          )}
          {isBooked(b) && (
            <button
              onClick={() => run(() => updateBooking(b.id, { paid: !b.paid }))}
              disabled={busy}
              className={`block ml-auto mt-1 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${b.paid ? 'text-accent' : 'text-muted hover:text-foreground'}`}
            >
              {b.paid ? '✓ Paid' : 'Mark paid'}
            </button>
          )}
        </div>
      </div>

      {/* Row 1: contact and manage. Row 2: the next step. Two rows so it fits any phone. */}
      <div className="flex items-center justify-between pt-2 -mx-2.5">
        <div className="flex">
          <a href={`tel:+91${b.phone}`} aria-label="Call" className={iconButton}>
            <Phone className="w-5 h-5" />
          </a>
          <a href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(customerMessage(b))}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="p-2.5 text-muted hover:text-[#25D366] transition-colors">
            <MessageCircle className="w-5 h-5" />
          </a>
          {b.location && (
            <a href={mapsLink(b.location)} target="_blank" rel="noopener noreferrer" aria-label="Open pinned location in Google Maps" className={iconButton}>
              <MapPin className="w-5 h-5" />
            </a>
          )}
        </div>
        <div className="flex">
          <button onClick={() => setEditing(true)} disabled={busy} aria-label="Edit booking" className={iconButton}>
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={remove} disabled={busy} aria-label="Delete booking" className={iconButton}>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2 pt-2">
          {actions.map(([label, status, question], i) => (
            <Button
              key={status}
              variant={i === actions.length - 1 ? 'primary' : 'outline'}
              disabled={busy}
              onClick={() => move(status, question)}
              className="flex-1"
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
