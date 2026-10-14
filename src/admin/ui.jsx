// Small building blocks so the admin panel matches the website's styling.
import { cn } from '../lib/utils';

// 16px text on phones stops iPhone zooming in on a field; the date/time tweaks stop
// iPhone's date and time boxes from overflowing or centring their text.
export const inputClass = "w-full min-w-0 appearance-none bg-background border border-border px-3 sm:px-4 py-3 text-base sm:text-sm font-medium text-foreground rounded-none focus:outline-none focus:border-accent transition-colors [&::-webkit-date-and-time-value]:text-left";
export const labelClass = "block text-[10px] font-bold text-muted tracking-widest uppercase mb-2";

export function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'primary' && "bg-accent hover:bg-accent-hover text-white",
        variant === 'outline' && "border border-border hover:border-foreground text-foreground",
        variant === 'ghost' && "text-muted hover:text-accent px-2",
        className,
      )}
      {...props}
    />
  );
}

export function PageTitle({ kicker, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">{kicker}</p>
        <h1 className="text-2xl font-bold tracking-tight uppercase">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Section({ title, action, children }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3 min-h-8">
        <h2 className="text-xs font-bold tracking-widest uppercase text-muted">{title}</h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function Empty({ children }) {
  return <p className="text-sm text-muted/70 border border-dashed border-border p-6 text-center">{children}</p>;
}

export function Stat({ label, value, sub, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className="glass p-5 text-left w-full flex flex-col justify-start">
      <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted uppercase tracking-wider mt-1">{sub}</p>}
    </Tag>
  );
}

const STATUS = {
  pending: { label: 'New', className: 'bg-accent text-white' },
  confirmed: { label: 'Confirmed', className: 'border border-accent text-accent' },
  delivered: { label: 'With customer', className: 'bg-foreground text-background' },
  returned: { label: 'Returned', className: 'border border-border text-muted' },
  cancelled: { label: 'Cancelled', className: 'border border-border text-muted/60 line-through' },
};

export function StatusPill({ status }) {
  const { label, className } = STATUS[status] ?? STATUS.pending;
  return <span className={cn("text-[9px] font-bold tracking-widest uppercase px-2 py-1", className)}>{label}</span>;
}
