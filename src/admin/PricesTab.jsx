import { useState } from 'react';
import { X } from 'lucide-react';
import { formatINR, quote } from '../lib/booking';
import { savePricing } from './data';
import { tell } from './dialogs';
import { Button, PageTitle, Section, inputClass, labelClass } from './ui';

// Turns the form's text inputs back into the numbers the website uses.
function cleanPricing(draft) {
  const tiers = (list) => list
    .map(t => ({ minDays: Math.round(Number(t.minDays)), pricePerDay: Math.round(Number(t.pricePerDay)) }))
    .filter(t => t.minDays > 1 && t.pricePerDay > 0)
    .sort((a, b) => a.minDays - b.minDays);
  return {
    basePricePerDay: Math.round(Number(draft.basePricePerDay)),
    discounts: tiers(draft.discounts),
    extraController: {
      basePricePerDay: Math.round(Number(draft.extraController.basePricePerDay)),
      discounts: tiers(draft.extraController.discounts),
    },
    maxDays: Math.round(Number(draft.maxDays)),
  };
}

function TierEditor({ title, base, discounts, onChange }) {
  const setTier = (i, field, value) => onChange({ base, discounts: discounts.map((t, j) => (j === i ? { ...t, [field]: value } : t)) });

  return (
    <Section title={title}>
      <div className="glass p-5 space-y-3">
        <div>
          <label className={labelClass}>Price per day (₹)</label>
          <input type="number" inputMode="numeric" min="1" required value={base} onChange={(e) => onChange({ base: e.target.value, discounts })} className={inputClass} />
        </div>
        {discounts.map((tier, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className={labelClass}>From day</label>
              <input type="number" inputMode="numeric" min="2" value={tier.minDays} onChange={(e) => setTier(i, 'minDays', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>₹ per day</label>
              <input type="number" inputMode="numeric" min="1" value={tier.pricePerDay} onChange={(e) => setTier(i, 'pricePerDay', e.target.value)} className={inputClass} />
            </div>
            <button
              type="button"
              onClick={() => onChange({ base, discounts: discounts.filter((_, j) => j !== i) })}
              aria-label="Remove discount"
              className="p-3 text-muted hover:text-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => onChange({ base, discounts: [...discounts, { minDays: '', pricePerDay: '' }] })}>
          + Add discount
        </Button>
      </div>
    </Section>
  );
}

export default function PricesTab({ pricing }) {
  const [draft, setDraft] = useState(() => structuredClone(pricing));
  const [calc, setCalc] = useState({ days: 3, extraController: false });
  const [state, setState] = useState('idle'); // idle | saving | saved

  const edit = (next) => {
    setDraft(next);
    setState('idle');
  };

  const clean = cleanPricing(draft);
  const valid = clean.basePricePerDay > 0 && clean.extraController.basePricePerDay > 0 && clean.maxDays >= 1 && clean.maxDays <= 60;
  const calcDays = Math.min(calc.days, clean.maxDays || 1);

  const save = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setState('saving');
    try {
      await savePricing(clean);
      setDraft(structuredClone(clean));
      setState('saved');
    } catch (err) {
      await tell(err.message);
      setState('idle');
    }
  };

  return (
    <form onSubmit={save}>
      <PageTitle kicker="Website" title="Prices" />

      <TierEditor
        title="PS5 rental"
        base={draft.basePricePerDay}
        discounts={draft.discounts}
        onChange={({ base, discounts }) => edit({ ...draft, basePricePerDay: base, discounts })}
      />

      <TierEditor
        title="Extra controller"
        base={draft.extraController.basePricePerDay}
        discounts={draft.extraController.discounts}
        onChange={({ base, discounts }) => edit({ ...draft, extraController: { basePricePerDay: base, discounts } })}
      />

      <Section title="Booking length">
        <div className="glass p-5">
          <label className={labelClass}>Longest rental (days)</label>
          <input type="number" inputMode="numeric" min="1" max="60" required value={draft.maxDays} onChange={(e) => edit({ ...draft, maxDays: e.target.value })} className={inputClass} />
        </div>
      </Section>

      <Section title="Price calculator">
        <div className="glass p-5">
          <div className="flex justify-between items-end mb-2">
            <span className={labelClass}>Duration</span>
            <span className="text-2xl font-bold">{calcDays} DAY{calcDays > 1 ? 'S' : ''}</span>
          </div>
          <input
            type="range" min="1" max={clean.maxDays || 1} value={calcDays}
            onChange={(e) => setCalc({ ...calc, days: Number(e.target.value) })}
            className="w-full h-2 bg-muted/20 rounded-full appearance-none cursor-pointer accent-accent mb-4"
          />
          <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide cursor-pointer mb-4">
            <input type="checkbox" switch="" checked={calc.extraController} onChange={(e) => setCalc({ ...calc, extraController: e.target.checked })} className="accent-accent" />
            Extra controller
          </label>
          <div className="flex justify-between items-end pt-4 border-t border-border">
            <span className="text-xs font-bold text-muted tracking-widest uppercase">Customer pays</span>
            <span className="text-3xl font-bold">{formatINR(quote(clean, calcDays, calc.extraController).total)}</span>
          </div>
        </div>
      </Section>

      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] bg-background py-3 border-t border-border">
        <Button type="submit" disabled={!valid || state === 'saving'} className="w-full py-4">
          {state === 'saving' ? 'Saving…' : state === 'saved' ? '✓ Saved · live on the website within a minute' : 'Save prices'}
        </Button>
      </div>
    </form>
  );
}
