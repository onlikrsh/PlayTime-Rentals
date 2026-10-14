import { useId, useState } from 'react';
import { daysBetween, findClash, formatINR, isValidDate, isValidTime, normalizePhone, quote, rentalEnd } from '../lib/booking';
import { AREAS } from '../config/site';
import { tell } from './dialogs';
import { fmtShort } from './format';
import { Button, inputClass, labelClass } from './ui';

// The booking form used for adding a booking by hand (Calendar) and editing one (booking card).
// Start date, days and return date stay in step; each date has its own time.
// The total follows the price list when the days or extra controller change,
// and can always be typed over (discounts, late fees).
export default function BookingEditor({ initial, pricing, blocks, ignoreId, checkClash = true, submitLabel, onSave, onCancel }) {
  // { name, phone, area, start, startTime, days, endTime, extraController, total }
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const areasId = useId();

  const days = Math.round(Number(values.days));
  const end = isValidDate(values.start) && days >= 1 ? rentalEnd(values.start, days) : '';
  const listPrice = quote(pricing, days >= 1 ? days : 1, values.extraController).total;

  const change = (field, value) => {
    const next = { ...values, [field]: value };
    if (field === 'days' || field === 'extraController') {
      next.total = quote(pricing, Math.max(1, Math.round(Number(next.days)) || 1), next.extraController).total;
    }
    setValues(next);
  };

  // Picking a return date sets the number of days.
  const changeEnd = (iso) => {
    const newDays = isValidDate(values.start) && isValidDate(iso) ? daysBetween(values.start, iso) : 0;
    if (newDays >= 1) change('days', newDays);
  };

  const save = async (e) => {
    e.preventDefault();
    const phone = normalizePhone(values.phone);
    if (!phone) return tell('Please enter a valid 10-digit mobile number.');
    if (!end) return tell('Please check the start date and number of days.');
    if (!isValidTime(values.startTime) || !isValidTime(values.endTime)) return tell('Please set the start and return times.');
    if (checkClash) {
      const clash = findClash(blocks, { start: values.start, end }, ignoreId);
      if (clash) {
        return tell(`Those dates overlap ${clash.bookingId ? 'another booking' : 'blocked dates'} (${fmtShort(clash.start)} – ${fmtShort(clash.end)}).`);
      }
    }
    setBusy(true);
    try {
      await onSave({
        name: values.name.trim(),
        phone,
        area: values.area.trim(),
        start: values.start,
        startTime: values.startTime,
        end,
        endTime: values.endTime,
        days,
        extraController: values.extraController,
        total: Math.round(Number(values.total)) || 0,
      });
    } catch (err) {
      await tell(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div><label className={labelClass}>Name</label><input required value={values.name} onChange={(e) => change('name', e.target.value)} className={inputClass} /></div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 min-[400px]:gap-3">
        <div><label className={labelClass}>Mobile</label><input required type="tel" inputMode="tel" value={values.phone} onChange={(e) => change('phone', e.target.value)} className={inputClass} /></div>
        <div>
          <label className={labelClass}>Area or address</label>
          <input required list={areasId} value={values.area} onChange={(e) => change('area', e.target.value)} className={`${inputClass} no-list-arrow`} />
          <datalist id={areasId}>{AREAS.map(a => <option key={a} value={a} />)}</datalist>
        </div>
      </div>

      <div>
        <label className={labelClass}>Delivery (start)</label>
        <div className="flex flex-col min-[360px]:flex-row gap-2">
          <input type="date" required aria-label="Start date" value={values.start} onChange={(e) => change('start', e.target.value)} className={`${inputClass} flex-1`} />
          <input type="time" required step="900" aria-label="Start time" value={values.startTime} onChange={(e) => change('startTime', e.target.value)} className={`${inputClass} min-[360px]:w-32 shrink-0`} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Return (pickup)</label>
        <div className="flex flex-col min-[360px]:flex-row gap-2">
          <input type="date" required aria-label="Return date" value={end} min={values.start} onChange={(e) => changeEnd(e.target.value)} className={`${inputClass} flex-1`} />
          <input type="time" required step="900" aria-label="Return time" value={values.endTime} onChange={(e) => change('endTime', e.target.value)} className={`${inputClass} min-[360px]:w-32 shrink-0`} />
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="w-28 shrink-0"><label className={labelClass}>Days</label><input type="number" inputMode="numeric" min="1" max="60" required value={values.days} onChange={(e) => change('days', e.target.value)} className={inputClass} /></div>
        <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide cursor-pointer py-3">
          <input type="checkbox" checked={values.extraController} onChange={(e) => change('extraController', e.target.checked)} className="w-5 h-5 accent-accent" />
          Extra controller
        </label>
      </div>
      <div>
        <label className={labelClass}>Total (₹) · price list says {formatINR(listPrice)}</label>
        <input type="number" inputMode="numeric" min="0" required value={values.total} onChange={(e) => change('total', e.target.value)} className={inputClass} />
      </div>
      <div className="flex gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-4">Cancel</Button>}
        <Button type="submit" disabled={busy} className="flex-1 py-4">{busy ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
