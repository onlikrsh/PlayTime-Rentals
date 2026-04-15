import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function RentalAgreement() {
  const [openId, setOpenId] = useState(null);

  const toggleOpen = (id) => {
    if (navigator.vibrate) navigator.vibrate(5);
    setOpenId(openId === id ? null : id);
  };

  const agreements = [
    {
      id: "01",
      title: "BOOKING & PAYMENT",
      content: [
        "Booking is confirmed only after customer signs the digital rental agreement and completes payment at the time of delivery.",
        "Payment is collected after device delivery and setup. Rental period begins once the console is successfully installed and demonstrated working.",
        "Prices may vary during weekends, holidays and high demand periods.",
        "Rental duration for 1-day booking is calculated from 12:00 PM to next day 12:00 PM."
      ]
    },
    {
      id: "02",
      title: "DELIVERY & SETUP",
      content: [
        "We provide home delivery and professional setup across Vizag (Visakhapatnam).",
        "Delivery includes: PS5 console, Controller, HDMI cable, Power cable, Pre-installed games (PS Plus Deluxe & EA Play).",
        "Customer must ensure: Working TV or monitor with HDMI port, Stable power supply, Safe indoor placement space.",
        "Our team will setup the device and confirm proper working before leaving."
      ]
    },
    {
      id: "03",
      title: "SECURITY & VERIFICATION",
      content: [
        "Valid Government ID proof (Aadhaar / PAN) and address confirmation are required before delivery.",
        "Customer must provide correct contact number and delivery details.",
        "Console must remain at the registered delivery address during the rental period.",
        "We reserve the right to refuse service if verification is incomplete or suspicious."
      ]
    },
    {
      id: "04",
      title: "USAGE POLICY",
      content: [
        "Console must be used responsibly.",
        "Not allowed: Opening the console, Hardware modification, Software tampering, Attempting jailbreak or illegal downloads, Renting or giving to third party, Relocating device without informing.",
        "All games are provided via official PS Plus Deluxe and EA Play subscriptions.",
        "Additional games may be added depending on availability."
      ]
    },
    {
      id: "05",
      title: "DAMAGE & LIABILITY",
      content: [
        "Customer is responsible for maintaining device condition during rental.",
        "Charges apply for: Physical damage, Liquid damage, Controller damage, Missing accessories, Power damage due to improper usage.",
        "Minor wear is acceptable. Major damage or loss will be charged based on repair or replacement cost.",
        "Legal action may be taken in case of theft or intentional damage."
      ]
    },
    {
      id: "06",
      title: "CANCELLATION & REFUNDS",
      content: [
        "Free cancellation allowed up to 24 hours before delivery time.",
        "Same day cancellation may incur delivery charge.",
        "No refund once rental period has started.",
        "Refunds (if applicable) are processed within 3–5 working days.",
        "Date modifications are allowed based on availability."
      ]
    },
    {
      id: "07",
      title: "LATE RETURNS & EXTENSION",
      content: [
        "Rental extension is allowed subject to availability.",
        "Late returns without notice may be charged at 1.5x daily rate.",
        "Customer must inform at least 4 hours before rental end time for extension request.",
        "If extension is unavailable, device must be returned at agreed time."
      ]
    },
    {
      id: "08",
      title: "PICKUP & SUPPORT",
      content: [
        "Pickup is scheduled between 10 AM – 7 PM on end date.",
        "Customer must ensure device is ready for pickup.",
        "Support is available via WhatsApp for: setup help, troubleshooting, extension requests.",
        "We aim to provide smooth and hassle-free gaming experience across Vizag."
      ]
    },
    {
      id: "09",
      title: "ADD-ON: EXTRA CONTROLLER",
      content: [
        "Adding an extra dual-sense controller is dynamically priced based on rental duration.",
        "1 to 2 Days: ₹150 per day.",
        "3 to 6 Days: ₹100 per day.",
        "7+ Days: ₹50 per day."
      ]
    }
  ];

  return (
    <section className="py-24 bg-card border-t border-border" id="rental-agreement">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 text-center">
          <p className="text-xs font-bold text-accent tracking-[0.2em] mb-4">LEGAL FRAMEWORK</p>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Rental Agreement</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Please review our streamlined policies designed to provide you with a secure, zero-deposit, premium console experience in Vizag.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {agreements.map((rule) => {
            const isOpen = openId === rule.id;
            return (
              <motion.div 
                key={rule.id}
                className={`border rounded-xl overflow-hidden shadow-sm transition-colors duration-300 ${isOpen ? 'border-accent bg-accent/5' : 'border-border bg-background hover:border-muted/50 hover:bg-muted/5'}`}
              >
                <button 
                  onClick={() => toggleOpen(rule.id)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-light transition-colors ${isOpen ? 'text-accent' : 'text-muted/50'}`}>
                      {rule.id}
                    </span>
                    <h3 className={`text-sm md:text-base font-bold tracking-wider uppercase transition-colors ${isOpen ? 'text-foreground' : 'text-foreground/80'}`}>
                      {rule.title}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ml-4 transition-colors ${isOpen ? 'bg-accent text-background' : 'bg-muted/10 text-muted group-hover:bg-muted/20'}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 md:px-8 pb-8 pt-2 pl-[5.5rem] md:pl-[6.5rem] border-t border-border/40">
                        <ul className="space-y-4 mt-6">
                          {rule.content.map((point, idx) => (
                            <li key={idx} className="text-sm text-muted leading-relaxed relative before:content-[''] before:absolute before:left-[-1.2rem] before:top-[0.6rem] before:w-1.5 before:h-1.5 before:bg-accent/50 before:rounded-full">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
