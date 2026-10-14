import { useState } from 'react';
import { quote } from '../lib/booking';
import { whatsappLink } from '../config/site';
import { haptic } from '../lib/haptics';
import { MessageCircle, Settings } from 'lucide-react';

export default function Configurator({ duration, setDuration, pricing, onConfirm }) {
  const [extraController, setExtraController] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Volume discounts for the console and the extra controller come from `pricing`
  const { controllerPerDay: currentExtraCtrlPrice, total: totalPrice } = quote(pricing, duration, extraController);

  return (
    <div id="accessories" className="glass p-8 border border-border h-full flex flex-col scroll-mt-24">
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
            max={pricing.maxDays} 
            value={duration} 
            onChange={(e) => {
               setDuration(parseInt(e.target.value));
               haptic();
            }}
            className="w-full h-2 bg-muted/20 rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] font-medium text-muted tracking-widest">
            <span>1 DAY</span>
            <span>{Math.ceil((1 + pricing.maxDays) / 2)} DAYS</span>
            <span>{pricing.maxDays} DAYS</span>
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
              onClick={() => setSmsNotifications(!smsNotifications)}
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
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase">+₹{currentExtraCtrlPrice}/day</span>
                  <span className="text-[8px] text-accent font-bold uppercase tracking-widest mt-0.5">Price drops based on days</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setExtraController(!extraController)}
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
              onConfirm({
                duration,
                extraController,
                smsNotifications,
                totalPrice
              });
            }}
            className="flex-1 bg-accent hover:bg-accent-hover text-white py-4 font-bold tracking-wider transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            CONFIRM BOOKING
          </button>
          
          <button 
            onClick={() => {
              window.open(whatsappLink(`Hi, I'd like to book a PS5 for ${duration} days. Total: ₹${totalPrice}.`), '_blank');
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
