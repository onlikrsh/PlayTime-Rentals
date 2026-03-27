import { useState, useEffect, memo } from 'react';
import Hero from '../components/Hero';
import BookingCalendar from '../components/BookingCalendar';
import Configurator from '../components/Configurator';
import PricingCards from '../components/PricingCards';
import GameLibrary from '../components/GameLibrary';
import RentalAgreement from '../components/RentalAgreement';
import Socials from '../components/Socials';
import { getBookedDates, saveBooking } from '../firebase/bookings';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// -----------------------------------------------------------------------------
// PERFORMANCE OPTIMIZATION:
// Wrapping these heavy structural components in React.memo prevents them 
// from catastrophically re-rendering every time the user drags the duration slider!
// -----------------------------------------------------------------------------
const MemoizedPricingCards = memo(PricingCards);
const MemoizedGameLibrary = memo(GameLibrary);
const MemoizedSocials = memo(Socials);
const MemoizedRentalAgreement = memo(RentalAgreement);
// We also memoize Hero, but it takes an inline un-memoized prop function natively.
// Since we pass a stable reference to it, it will perfectly freeze.
const MemoizedHero = memo(Hero);

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [duration, setDuration] = useState(1);
  const [bookedDates, setBookedDates] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch booked dates on mount (Mocked for frontend-only launch)
  useEffect(() => {
    const fetchDates = async () => {
      setBookedDates([]); // Empty array keeps calendar fully open
    };
    fetchDates();
  }, []);

  const handleStartJourney = () => {
    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmBooking = async (config) => {
    if (!selectedDate) {
      alert("Please select a start date first.");
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsBooking(true);
    
    // Format variables for the WhatsApp payload
    const startDateFormatted = format(selectedDate, 'MMM do, yyyy');
    const endDate = new Date(selectedDate.getTime() + (duration * 24 * 60 * 60 * 1000));
    const endDateFormatted = format(endDate, 'MMM do, yyyy');

    let addons = [];
    if (config.extraController) addons.push("Extra Controller");
    if (config.smsNotifications) addons.push("SMS Notifications");

    // Construct the elegant booking message
    const message = encodeURIComponent(
      `Hi PlayTime Rentals,\nI'd like to book a PS5 console!\n\n` +
      `📅 *Duration:* ${config.duration} Day${config.duration > 1 ? 's' : ''}\n` +
      `⏳ *From:* ${startDateFormatted} at 12:00 PM\n` +
      `⏳ *To:* ${endDateFormatted} at 12:00 PM\n` +
      `🎮 *Add-ons:* ${addons.length > 0 ? addons.join(', ') : 'None'}\n` +
      `💰 *Grand Total:* ₹${config.totalPrice.toLocaleString('en-IN')}\n\n` +
      `Is this available for delivery?`
    );

    // IMPORTANT: Swap below with your actual business WhatsApp number if it changes
    const WHATSAPP_NUMBER = "+916281496238"; 
    
    // Simulate minor processing time to feel premium, then redirect
    setTimeout(() => {
      setIsBooking(false);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 shadow-2xl flex items-center gap-3 backdrop-blur-md font-bold tracking-wider text-sm uppercase"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Booking Confirmed Continuously!
          </motion.div>
        )}
      </AnimatePresence>

      <MemoizedHero onStartJourney={handleStartJourney} />

      <section id="booking-section" className="py-24 bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-full w-full"
          >
            <BookingCalendar 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              duration={duration}
              bookedDates={bookedDates}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-full w-full"
          >
            <Configurator 
              duration={duration}
              setDuration={setDuration}
              onConfirm={handleConfirmBooking}
              isBooking={isBooking}
            />
          </motion.div>

        </div>
      </section>

      <MemoizedPricingCards />
      <MemoizedGameLibrary />
      <MemoizedSocials />
      <MemoizedRentalAgreement />

    </div>
  );
}
