import { pricing } from '../config/pricing';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function PricingCards() {
  
  const sortedDiscounts = [...pricing.discounts].sort((a,b) => a.minDays - b.minDays);
  
  const tiers = [
    {
      name: `1-${sortedDiscounts.length > 0 ? sortedDiscounts[0].minDays - 1 : 6} DAYS`,
      price: pricing.basePricePerDay,
      popular: false,
    },
    ...sortedDiscounts.map((discount, i) => {
      const nextDiscount = sortedDiscounts[i + 1];
      const isLast = i === sortedDiscounts.length - 1;
      const name = isLast ? `${discount.minDays}+ DAYS` : `${discount.minDays}-${nextDiscount.minDays - 1} DAYS`;
      const label = discount.minDays === 7 ? "POPULAR" : (isLast ? "EXTENDED" : "");
      
      return {
        name,
        price: discount.pricePerDay,
        popular: discount.minDays === 7,
        label: label || undefined
      };
    })
  ];

  return (
    <section className="py-20 bg-background border-t border-border">
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
