import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-card w-full py-16 border-t border-border mt-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & SEO Description */}
          <div className="md:col-span-5 lg:col-span-4">
            <h3 className="font-bold text-lg tracking-[0.2em] uppercase mb-4 text-foreground">
              PLAYTIME RENTALS – PS5 RENTAL VIZAG
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Premium PlayStation 5 rentals in Vizag with free home delivery and zero deposit options. Enjoy top PS5 games with hassle-free setup and flexible rental durations across Visakhapatnam.
            </p>
          </div>

          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Links Columns */}
          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Product */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-widest uppercase text-muted/70 mb-2">Product</h4>
              <a href="/#booking-section" className="text-sm text-muted hover:text-accent transition-colors">Availability</a>
              <a href="/#game-library" className="text-sm text-muted hover:text-accent transition-colors">Game Library</a>
              <a href="/#pricing" className="text-sm text-muted hover:text-accent transition-colors">Pricing</a>
              <a href="/#accessories" className="text-sm text-muted hover:text-accent transition-colors">Accessories</a>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-widest uppercase text-muted/70 mb-2">Support</h4>
              <Link to="/terms-and-conditions" className="text-sm text-muted hover:text-accent transition-colors">Terms & Conditions</Link>
              <Link to="/privacy-policy" className="text-sm text-muted hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/cancellation-policy" className="text-sm text-muted hover:text-accent transition-colors">Cancellation Policy</Link>
              <a href="/#contact" className="text-sm text-muted hover:text-accent transition-colors">Contact</a>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-widest uppercase text-muted/70 mb-2">Company</h4>
              <Link to="/about" className="text-sm text-muted hover:text-accent transition-colors">About</Link>
              <a href="/#how-it-works" className="text-sm text-muted hover:text-accent transition-colors">How it Works</a>
              <Link to="/delivery-policy" className="text-sm text-muted hover:text-accent transition-colors">Delivery Areas in Vizag</Link>
            </div>

          </div>
        </div>

        {/* SEO Boost Area */}
        <div className="pt-8 border-t border-border flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
           <p className="text-xs text-muted/80 leading-relaxed font-medium">
             <span className="font-bold text-muted uppercase tracking-widest mr-2">Serving all major areas in Vizag:</span>
             MVP Colony • Madhurawada • Gajuwaka • Rushikonda • PM Palem • Seethammadhara • Dwaraka Nagar • Yendada
           </p>
           <p className="text-[10px] text-muted/50 uppercase tracking-widest">
             © {new Date().getFullYear()} PlayTime Rentals. Trusted by gamers across Vizag 🎮
           </p>
        </div>

      </div>
    </footer>
  );
}
