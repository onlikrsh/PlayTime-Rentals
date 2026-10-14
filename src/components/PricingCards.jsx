import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { priceTable } from '../lib/booking';

export default function PricingCards({ pricing }) {
  
  const rows = priceTable(pricing.basePricePerDay, pricing.discounts, pricing.maxDays);
  
  const tiers = rows.map((row, i) => {
    const isLast = i === rows.length - 1;
    const name = row.from === row.to ? `${row.from} DAY${row.from > 1 ? 'S' : ''}` : `${row.from}-${row.to} DAYS`;
    const label = row.from === 7 ? "POPULAR" : (isLast && i > 0 ? "EXTENDED" : "");

    return {
      name,
      price: row.pricePerDay,
      popular: row.from === 7,
      label: label || undefined
    };
  });

  return (
    <section id="pricing" className="py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Volume Discounts</h2>
          <p className="text-muted">Longer play sessions deserve better rates.</p>
        </div>

        <div className={`grid grid-cols-1 gap-6 ${tiers.length > 3 ? 'md:grid-cols-4 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {tiers.map((tier, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={tier.name}
              className={cn(
                "relative flex flex-col p-8 glass group hover:border-accent transition-colors duration-300",
                tier.popular ? "border-accent ring-1 ring-accent" : "border-border"
              )}
            >
              {tier.label && (
                <div className="absolute -top-3 left-8 bg-accent text-white text-[10px] font-bold px-3 py-1 tracking-widest uppercase">
                  {tier.label}
                </div>
              )}
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-sm font-bold text-muted mb-2 tracking-wider">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">₹{tier.price}</span>
                    <span className="text-sm text-muted font-medium">/day</span>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
