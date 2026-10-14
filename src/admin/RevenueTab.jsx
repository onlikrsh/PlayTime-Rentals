import { useState } from 'react';
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { formatINR } from '../lib/booking';
import { addExpense, removeExpense, updateBooking } from './data';
import { fmtShort, isBooked, plural, sum, toISO, todayISO } from './format';
import { Button, Empty, PageTitle, Section, Stat, inputClass, labelClass } from './ui';

// Income is counted in the month the rental starts.
function periodRange(id) {
  const now = new Date();
  if (id === 'month') return [toISO(startOfMonth(now)), toISO(endOfMonth(now))];
  if (id === 'last') { const last = addMonths(now, -1); return [toISO(startOfMonth(last)), toISO(endOfMonth(last))]; }
  if (id === 'year') return [`${now.getFullYear()}-01-01`, `${now.getFullYear()}-12-31`];
  return ['0000-01-01', '9999-12-31'];
}

const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: 'last', label: 'Last month' },
  { id: 'year', label: 'This year' },
  { id: 'all', label: 'All time' },
];

export default function RevenueTab({ bookings, expenses }) {
  const [period, setPeriod] = useState('month');
  const [from, to] = periodRange(period);
  const inPeriod = (iso) => iso >= from && iso <= to;

  const booked = bookings.filter(b => isBooked(b) && inPeriod(b.start));
  const revenue = sum(booked, 'total');
  const collected = sum(booked.filter(b => b.paid), 'total');
  const periodExpenses = expenses.filter(e => inPeriod(e.date));
  const spent = sum(periodExpenses, 'amount');
  const daysRented = sum(booked, 'days');

  // Payment is collected on delivery, so anything delivered and unpaid is owed (any period).
  const owed = bookings
    .filter(b => (b.status === 'delivered' || b.status === 'returned') && !b.paid)
    .sort((a, b) => a.start.localeCompare(b.start));

  const months = Array.from({ length: 6 }, (_, i) => {
    const month = addMonths(new Date(), -i);
    const key = format(month, 'yyyy-MM');
    const income = sum(bookings.filter(b => isBooked(b) && b.start.startsWith(key)), 'total');
    const cost = sum(expenses.filter(e => e.date.startsWith(key)), 'amount');
    return { key, label: format(month, 'MMM yyyy'), income, cost };
  });
  const maxIncome = Math.max(1, ...months.map(m => m.income));

  return (
    <>
      <PageTitle kicker="Money" title="Revenue" />

      <div className="grid grid-cols-4 border border-border mb-6">
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${period === p.id ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Stat label="Revenue" value={formatINR(revenue)} sub={plural(booked.length, 'booking')} />
        <Stat label="Profit" value={formatINR(revenue - spent)} sub={`${formatINR(spent)} expenses`} />
        <Stat label="Collected" value={formatINR(collected)} sub="Marked paid" />
        <Stat label="To collect" value={formatINR(revenue - collected)} sub="Not paid yet" />
      </div>
      <p className="text-[10px] text-muted uppercase tracking-widest mb-10">
        {plural(daysRented, 'day')} rented{daysRented > 0 && ` · avg ${formatINR(Math.round(revenue / daysRented))}/day`}
      </p>

      {owed.length > 0 && (
        <Section title={`Unpaid after delivery · ${formatINR(sum(owed, 'total'))}`}>
          {owed.map(b => (
            <div key={b.id} className="glass p-4 flex justify-between items-center gap-4 text-sm">
              <span><span className="font-bold">{b.ref}</span> · {b.name} · {fmtShort(b.start)}</span>
              <span className="flex items-center gap-3 shrink-0">
                <span className="font-bold">{formatINR(b.total)}</span>
                <Button variant="outline" className="py-2" onClick={() => updateBooking(b.id, { paid: true })}>Paid</Button>
              </span>
            </div>
          ))}
        </Section>
      )}

      <Section title="Last 6 months">
        <div className="glass p-5 space-y-4">
          {months.map(m => (
            <div key={m.key}>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                <span>{m.label}</span>
                <span>{formatINR(m.income)} <span className="text-muted font-medium">− {formatINR(m.cost)} = {formatINR(m.income - m.cost)}</span></span>
              </div>
              <div className="h-2 bg-muted/10">
                <div className="h-full bg-accent" style={{ width: `${(m.income / maxIncome) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={`Expenses · ${formatINR(spent)}`}>
        <ExpenseForm />
        {periodExpenses.map(e => (
          <div key={e.id} className="glass p-4 flex justify-between items-center gap-4 text-sm">
            <span><span className="text-muted">{fmtShort(e.date)}</span> · {e.label}</span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="font-bold">{formatINR(e.amount)}</span>
              <button
                onClick={() => window.confirm(`Delete "${e.label}"?`) && removeExpense(e.id)}
                aria-label="Delete expense"
                className="p-2 text-muted hover:text-accent transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </span>
          </div>
        ))}
        {periodExpenses.length === 0 && <Empty>No expenses in this period</Empty>}
      </Section>
    </>
  );
}

function ExpenseForm() {
  const [values, setValues] = useState({ date: todayISO(), label: '', amount: '' });
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const amount = Math.round(Number(values.amount));
    if (!(amount > 0)) return;
    setBusy(true);
    try {
      await addExpense({ date: values.date, label: values.label.trim(), amount });
      setValues({ ...values, label: '', amount: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="glass p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
      <div className="col-span-2"><label className={labelClass}>What for</label><input required value={values.label} onChange={set('label')} placeholder="e.g. Fuel, PS Plus, repair" className={inputClass} /></div>
      <div><label className={labelClass}>Amount (₹)</label><input required type="number" inputMode="numeric" min="1" value={values.amount} onChange={set('amount')} className={inputClass} /></div>
      <div><label className={labelClass}>Date</label><input required type="date" value={values.date} onChange={set('date')} className={inputClass} /></div>
      <Button type="submit" disabled={busy} className="col-span-2 sm:col-span-4">Add expense</Button>
    </form>
  );
}
