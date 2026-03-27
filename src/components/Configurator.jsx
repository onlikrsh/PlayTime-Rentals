import { useState, useEffect } from 'react';
import { pricing } from '../config/pricing';
import { MessageCircle, Settings, Send } from 'lucide-react';

export default function Configurator({ duration, setDuration, onConfirm, isBooking }) {
  const [extraController, setExtraController] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Vibrate helper
  const triggerHaptic = (ms = 5) => {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  // Calculate pricing whenever config changes
  useEffect(() => {
    let pricePerDay = pricing.basePricePerDay;
    
    // Check volume discounts
    // Assuming discounts are ordered descending in minDays theoretically, but we evaluate based on thresholds
    // E.g., >= 15 days, >= 7 days
    const applicableDiscount = pricing.discounts
      .slice()
      .sort((a, b) => b.minDays - a.minDays)
      .find(d => duration >= d.minDays);

    if (applicableDiscount) {
      pricePerDay = applicableDiscount.pricePerDay;
    }

    let calculatedTotal = pricePerDay * duration;
    
    if (extraController) {
      calculatedTotal += pricing.extraControllerPricePerDay * duration;
    }

    setTotalPrice(calculatedTotal);
  }, [duration, extraController]);

  return (
    <div className="glass p-8 border border-border h-full flex flex-col">
      <div className="mb-8">
         <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">STEP 02</p>
         <h2 className="text-2xl font-bold tracking-tight uppercase">Configurator</h2>
      </div>

      <div className="flex-1 space-y-10 mb-8">
        
        {/* Duration Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <label className="text-xs font-bold tracking-widest uppercase text-muted">DURATION</label>
            <span className="text-2xl font-bold">{duration} DAY{duration > 1 ? 'S' : ''}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            value={duration} 
            onChange={(e) => {
               setDuration(parseInt(e.target.value));
               triggerHaptic();
            }}
            className="w-full h-2 bg-muted/20 rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] font-medium text-muted tracking-widest">
            <span>1 DAY</span>
            <span>7 DAYS</span>
            <span>15 DAYS</span>
          </div>
        </div>

        {/* Add-ons */}
        <div className="space-y-3">
          
          {/* SMS Notification Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/5 border border-border/50 rounded-sm">
            <div className="flex items-center gap-4">
              <MessageCircle className="w-5 h-5 text-muted" />
              <div>
                <p className="text-sm font-bold tracking-wide uppercase">SMS NOTIFICATIONS</p>
                <p className="text-[10px] text-muted uppercase">Available delivery status</p>
              </div>
            </div>
            <button 
              onClick={() => { setSmsNotifications(!smsNotifications); triggerHaptic(5); }}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${smsNotifications ? 'bg-accent' : 'bg-muted/30'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${smsNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Extra Controller Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/5 border border-border/50 rounded-sm">
            <div className="flex items-center gap-4">
              <Settings className="w-5 h-5 text-muted" />
              <div>
                <p className="text-sm font-bold tracking-wide uppercase">EXTRA CONTROLLER</p>
                <p className="text-[10px] text-muted uppercase">+₹{pricing.extraControllerPricePerDay}/day</p>
              </div>
            </div>
            <button 
              onClick={() => { setExtraController(!extraController); triggerHaptic(5); }}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${extraController ? 'bg-accent' : 'bg-muted/30'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${extraController ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
      </div>

      <div className="pt-6 border-t border-border mt-auto">
        <div className="flex justify-between items-end mb-6">
          <span className="text-xs font-bold text-muted tracking-widest uppercase">GRAND TOTAL</span>
          <div className="text-right">
             <span className="block text-3xl font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
             <span className="text-[10px] text-muted uppercase tracking-wider">inc. all taxes & delivery</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => {
              triggerHaptic(20);
              onConfirm({
                duration,
                extraController,
                smsNotifications,
                totalPrice
              });
            }}
            disabled={isBooking}
            className="flex-1 bg-accent hover:bg-accent-hover text-white py-4 font-bold tracking-wider transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBooking ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              <>CONFIRM BOOKING</>
            )}
          </button>
          
          <button 
            onClick={() => {
              triggerHaptic(20);
              const message = encodeURIComponent(`Hi, I'd like to book a PS5 for ${duration} days. Total: ₹${totalPrice}.`);
              window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
            }}
            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 font-bold tracking-wider transition-colors uppercase flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> BOOK VIA WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
}
