import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  // Replace with actual business WhatsApp number
  const phoneNumber = "1234567890"; 
  const message = encodeURIComponent("Hi, I want to rent a PS5!");

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      {/* Tooltip on desktop */}
      <span className="absolute right-full mr-4 bg-foreground text-background text-sm px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block pointer-events-none">
        Chat with us
      </span>
    </motion.button>
  );
}
