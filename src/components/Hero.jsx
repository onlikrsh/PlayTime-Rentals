import { ArrowRight, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero({ onStartJourney }) {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start"
          >
            <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-wider text-accent bg-accent/10 rounded border border-accent/20">
              PS5 RENTAL IN VIZAG
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] uppercase">
              RENT A PS5 IN VIZAG.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">Zero Deposit.</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">Free Delivery.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted mb-8 max-w-lg">
              Zero deposit. Free home delivery across Visakhapatnam. Play GTA V, Spider-Man 2, God of War Ragnarok, FIFA & more on premium PS5 consoles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  onStartJourney();
                }}
                className="group flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 font-semibold transition-all"
              >
                START YOUR JOURNEY 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  document.getElementById('game-library').scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 border-2 border-border hover:border-foreground text-foreground px-8 py-4 font-semibold transition-colors"
              >
                GAME LIBRARY
              </button>
            </div>
          </motion.div>

          {/* Product Image section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center items-center h-[400px] md:h-[600px]"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full z-10 flex justify-center h-full items-center scale-110 md:scale-125 will-change-transform"
            >
              <img 
                src="/ps5-hero.png" 
                alt="PlayTime Vizag Rentals PS5 Console" 
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
            
            {/* Premium backdrop glow highlighting the console */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/5 dark:bg-accent/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
