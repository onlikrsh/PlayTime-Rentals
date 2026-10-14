import { useState } from 'react';
import { Phone, MessageCircle, Check, MapPin, Pencil, Trash2 } from 'lucide-react';
import { findClash, formatINR, mapsLink } from '../lib/booking';
import { deleteBooking, editBooking, setStatus, updateBooking } from './data';
import BookingEditor from './BookingEditor';
import { fmtDay, fmtPhone, fmtShort, isBooked, plural, timeAgo } from './format';
import { Button, StatusPill, inputClass } from './ui';

// Next steps offered for each status: [label, new status, confirmation question]
const ACTIONS = {
  pending: [['Decline', 'cancelled', 'Decline this booking request?'], ['Confirm', 'confirmed']],
  confirmed: [['Cancel', 'cancelled', 'Cancel this booking? Its dates open up on the website again.'], ['Delivered', 'delivered']],
  delivered: [['Returned', 'returned']],
};

function customerMessage(b) {
  const first = b.name.split(' ')[0];
  if (b.status === 'confirmed') return `Hi ${first}, your PS5 booking ${b.ref} is confirmed! We'll deliver on ${fmtDay(b.start)} at 10:00 AM.`;
  return `Hi ${first}, this is PlayTime Rentals about your booking ${b.ref}.`;
}

export default function BookingCard({ booking: b, blocks, pricing }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(null); // string while editing the total

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const move = (status, question) => {
    if (question && !window.confirm(question)) return;
    if (status === 'confirmed') {
      const clash = findClash(blocks, b, b.id);
      if (clash) {
        alert(`Can't confirm: ${fmtShort(b.start)} – ${fmtShort(b.end)} overlaps ${clash.bookingId ? 'another booking' : 'blocked dates'} (${fmtShort(clash.start)} – ${fmtShort(clash.end)}).`);
        return;
      }
    }
    run(() => setStatus(b, status));
  };

  const remove = () => {
    const warning = {
      confirmed: ' Its dates will open up on the website again.',
      delivered: ' The console is still marked as out with this customer, and its dates will open up again.',
      returned: ` Its ${formatINR(b.total)} will be removed from your revenue.`,
    }[b.status] ?? '';
    if (!window.confirm(`Delete booking ${b.ref} (${b.name}) permanently?${warning}\n\nThis can't be undone.`)) return;
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

  if (editing) {
    return (
      <div className="glass p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-bold tracking-widest">EDIT {b.ref}</span>
          <StatusPill status={b.status} />
        </div>
        <BookingEditor
          initial={{ name: b.name, phone: b.phone, area: b.area, start: b.start, days: b.days, extraController: !!b.extraController, total: b.total }}
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
    <div className="glass p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest">{b.ref}</span>
          <StatusPill status={b.status} />
        </div>
        <span className="text-[10px] text-muted uppercase tracking-widest">{timeAgo(b.createdAt)}</span>
      </div>

      <p className="font-bold uppercase tracking-wide">{b.name}</p>
      <p className="text-sm text-muted mb-4">{b.area} · {fmtPhone(b.phone)}</p>

      <div className="flex justify-between items-end gap-4 pb-4 border-b border-border/50">
        <div className="text-sm">
          <p className="font-medium">{fmtDay(b.start)} → {fmtDay(b.end)}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider mt-1">
            {plural(b.days, 'day')} · 10:00 AM{addons.length > 0 && ` · ${addons.join(' · ')}`}
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
              <Button type="submit" disabled={busy} className="py-2 px-3"><Check className="w-4 h-4" /></Button>
            </form>
          )}
          {isBooked(b) && (
            <button
              onClick={() => run(() => updateBooking(b.id, { paid: !b.paid }))}
              disabled={busy}
              className={`block ml-auto mt-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${b.paid ? 'text-accent' : 'text-muted hover:text-foreground'}`}
            >
              {b.paid ? '✓ Paid' : 'Mark paid'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-4">
        <div className="flex gap-1">
          <a href={`tel:+91${b.phone}`} aria-label="Call" className="p-2 text-muted hover:text-accent transition-colors">
            <Phone className="w-5 h-5" />
          </a>
          <a
            href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(customerMessage(b))}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="p-2 text-muted hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          {b.location && (
            <a href={mapsLink(b.location)} target="_blank" rel="noopener noreferrer" aria-label="Open pinned location in Google Maps" className="p-2 text-muted hover:text-accent transition-colors">
              <MapPin className="w-5 h-5" />
            </a>
          )}
          <button onClick={() => setEditing(true)} disabled={busy} aria-label="Edit booking" className="p-2 text-muted hover:text-accent transition-colors">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={remove} disabled={busy} aria-label="Delete booking" className="p-2 text-muted hover:text-accent transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          {(ACTIONS[b.status] ?? []).map(([label, status, question], i, all) => (
            <Button
              key={status}
              variant={i === all.length - 1 ? 'primary' : 'outline'}
              disabled={busy}
              onClick={() => move(status, question)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
