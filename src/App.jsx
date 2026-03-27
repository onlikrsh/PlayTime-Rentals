import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ThemeToggle from './components/ThemeToggle';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';
import { Menu } from 'lucide-react';

import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import CancellationPolicy from './pages/legal/CancellationPolicy';
import DeliveryPolicy from './pages/legal/DeliveryPolicy';
import About from './pages/legal/About';

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="PlayTime Rentals" className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0" />
                <span className="font-bold text-sm sm:text-lg tracking-[0.1em] sm:tracking-[0.2em] uppercase truncate">PlayTime RENTALS</span>
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-8 items-center text-xs font-bold tracking-widest text-muted">
                <a href="/#booking-section" className="hover:text-foreground transition-colors">AVAILABILITY</a>
                <a href="/#game-library" className="hover:text-foreground transition-colors">GAME LIBRARY</a>
              </nav>

              {/* Right side controls */}
              <div className="flex items-center gap-4">
                <a 
                  href="/#booking-section"
                  className="hidden md:block bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors"
                >
                  RENT NOW
                </a>
                <ThemeToggle />
                
                {/* Mobile menu button */}
                <button 
                  onClick={() => { if (navigator.vibrate) navigator.vibrate(10); }}
                  className="md:hidden p-2"
                >
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/delivery-policy" element={<DeliveryPolicy />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  )
}

export default App
