import { useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isValidDate, quote } from '../lib/booking';
import { addBlock, addBooking, removeBlock } from './data';
import { fmtDay, fmtShort, toISO, todayISO } from './format';
import { Button, Empty, PageTitle, Section, inputClass, labelClass } from './ui';
import BookingEditor from './BookingEditor';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarTab({ bookings, blocks, pricing }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(todayISO);
  const [form, setForm] = useState(null); // 'block' | 'booking' | null

  const today = todayISO();
  const bookingsById = Object.fromEntries(bookings.map(b => [b.id, b]));
  const covering = (iso) => blocks.filter(b => b.start <= iso && iso <= b.end);
  const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
  const upcomingBlocks = blocks.filter(b => !b.bookingId && b.end >= today).sort((a, b) => a.start.localeCompare(b.start));

  const unblock = (block) => {
    if (window.confirm(`Unblock ${fmtShort(block.start)} – ${fmtShort(block.end)}?`)) removeBlock(block.id);
  };

  return (
    <>
      <PageTitle kicker="Availability" title="Calendar" />

      <div className="glass p-5 mb-6">
        <div className="flex justify-between items-center mb-4 text-sm font-bold uppercase tracking-widest">
          <button onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month" className="p-1 hover:text-accent transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span>{format(month, 'MMMM yyyy')}</span>
          <button onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month" className="p-1 hover:text-accent transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEK_DAYS.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-muted tracking-widest py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: month.getDay() }, (_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const iso = toISO(day);
            const items = covering(iso);
            const booked = items.some(b => b.bookingId);
            const manual = items.some(b => !b.bookingId);
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`h-10 text-sm font-medium transition-colors
                  ${booked ? 'bg-accent text-white' : manual ? 'bg-muted/25 text-muted line-through' : 'bg-background hover:bg-accent/10'}
                  ${iso < today ? 'opacity-40' : ''}
                  ${iso === today ? 'font-bold underline underline-offset-4' : ''}
                  ${iso === selected ? 'ring-2 ring-foreground ring-inset' : ''}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-[10px] font-bold text-muted uppercase tracking-widest">
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-accent" /> Booked</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-muted/25" /> Blocked</span>
        </div>
      </div>

      <Section title={fmtDay(selected)}>
        {covering(selected).map(block => {
          const booking = bookingsById[block.bookingId];
          return booking ? (
            <div key={block.id} className="glass p-4 text-sm">
              <span className="font-bold">{booking.ref}</span> · {booking.name} · {fmtShort(booking.start)} → {fmtShort(booking.end)}
            </div>
          ) : (
            <div key={block.id} className="glass p-4 text-sm flex justify-between items-center gap-4">
              <span><span className="font-bold">Blocked</span>{block.note && ` · ${block.note}`} · {fmtShort(block.start)} → {fmtShort(block.end)}</span>
              <Button variant="ghost" onClick={() => unblock(block)}>Unblock</Button>
            </div>
          );
        })}
        {covering(selected).length === 0 && <Empty>Free</Empty>}
      </Section>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <Button variant={form === 'block' ? 'primary' : 'outline'} onClick={() => setForm(form === 'block' ? null : 'block')}>+ Block dates</Button>
        <Button variant={form === 'booking' ? 'primary' : 'outline'} onClick={() => setForm(form === 'booking' ? null : 'booking')}>+ Add booking</Button>
      </div>

      {form === 'block' && <BlockForm key={selected} start={selected} onDone={() => setForm(null)} />}
      {form === 'booking' && <AddBookingForm key={selected} start={selected} blocks={blocks} pricing={pricing} onDone={() => setForm(null)} />}

      {upcomingBlocks.length > 0 && (
        <Section title="Blocked dates">
          {upcomingBlocks.map(block => (
            <div key={block.id} className="glass p-4 text-sm flex justify-between items-center gap-4">
              <span>{fmtShort(block.start)} → {fmtShort(block.end)}{block.note && ` · ${block.note}`}</span>
              <Button variant="ghost" onClick={() => unblock(block)}>Unblock</Button>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}

function BlockForm({ start, onDone }) {
  const [values, setValues] = useState({ start, end: start, note: '' });
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!isValidDate(values.start) || !isValidDate(values.end) || values.end < values.start) {
      alert('The end date must be on or after the start date.');
      return;
    }
    setBusy(true);
    try {
      await addBlock(values.start, values.end, values.note.trim());
      onDone();
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="glass p-5 mb-10 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>From</label><input type="date" required value={values.start} onChange={set('start')} className={inputClass} /></div>
        <div><label className={labelClass}>To</label><input type="date" required value={values.end} onChange={set('end')} className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>Reason (optional)</label><input value={values.note} onChange={set('note')} placeholder="e.g. Maintenance" className={inputClass} /></div>
      <Button type="submit" disabled={busy} className="w-full">Block dates</Button>
    </form>
  );
}

function AddBookingForm({ start, blocks, pricing, onDone }) {
  return (
    <div className="glass p-5 mb-10">
      <BookingEditor
        initial={{ name: '', phone: '', area: '', start, days: 1, extraController: false, total: quote(pricing, 1, false).total }}
        pricing={pricing}
        blocks={blocks}
        submitLabel="Save confirmed booking"
        onSave={async (values) => {
          await addBooking(values);
          onDone();
        }}
      />
    </div>
  );
}
