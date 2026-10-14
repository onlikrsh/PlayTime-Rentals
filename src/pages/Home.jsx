import { useState, useEffect, memo } from 'react';
import Hero from '../components/Hero';
import BookingCalendar from '../components/BookingCalendar';
import Configurator from '../components/Configurator';
import PricingCards from '../components/PricingCards';
import GameLibrary from '../components/GameLibrary';
import RentalAgreement from '../components/RentalAgreement';
import Socials from '../components/Socials';
import BookingForm from '../components/BookingForm';
import { defaultPricing } from '../config/pricing';
import { motion } from 'framer-motion';

// -----------------------------------------------------------------------------
// PERFORMANCE OPTIMIZATION:
// Wrapping these heavy structural components in React.memo prevents them
// from catastrophically re-rendering every time the user drags the duration slider!
// -----------------------------------------------------------------------------
const MemoizedPricingCards = memo(PricingCards);
const MemoizedGameLibrary = memo(GameLibrary);
const MemoizedSocials = memo(Socials);
const MemoizedRentalAgreement = memo(RentalAgreement);
const MemoizedHero = memo(Hero);

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [duration, setDuration] = useState(1);
  const [pricing, setPricing] = useState(defaultPricing);
  const [blocks, setBlocks] = useState([]);
  const [request, setRequest] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Live prices and booked dates (reloaded after each booking). If the API can't be
  // reached, the default prices stay and every date shows as open; bookings are
  // re-checked when submitted anyway.
  useEffect(() => {
    let active = true;
    fetch('/api/availability')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!active || !data) return;
        setPricing(data.pricing);
        setBlocks(data.blocks);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [refreshCount]);

  // Footer and menu links (e.g. /#pricing) clicked on another page land here: scroll to that section.
  useEffect(() => {
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView();
  }, []);

  const days = Math.min(duration, pricing.maxDays);

  const handleStartJourney = () => {
    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmBooking = (config) => {
    if (!selectedDate) {
      alert("Please select a start date first.");
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setRequest(config);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">

      {request && (
        <BookingForm
          start={selectedDate}
          config={request}
          onClose={() => setRequest(null)}
          onBooked={() => setRefreshCount(n => n + 1)}
        />
      )}

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
              duration={days}
              blocks={blocks}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-full w-full"
          >
            <Configurator
              duration={days}
              setDuration={setDuration}
              pricing={pricing}
              onConfirm={handleConfirmBooking}
            />
          </motion.div>

        </div>
      </section>

      <MemoizedPricingCards pricing={pricing} />
      <MemoizedGameLibrary />
      <MemoizedSocials />
      <MemoizedRentalAgreement pricing={pricing} />

    </div>
  );
}
