import { motion } from 'framer-motion';

const InstagramIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default function Socials() {
  // To add X or Telegram, simply uncomment the lines below and update the urls.
  const socials = [
    { name: 'Instagram', icon: <InstagramIcon />, url: 'https://www.instagram.com/playtime.rentals/', color: 'hover:text-pink-500' },
    // { name: 'X / Twitter', icon: <TwitterIcon />, url: '#', color: 'hover:text-blue-400' },
    // { name: 'Telegram', icon: <TelegramIcon />, url: '#', color: 'hover:text-blue-500' }
  ];

  return (
    <section className="py-20 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <p className="text-xs font-bold text-muted tracking-[0.2em] mb-4">COMMUNITY</p>
        <h2 className="text-3xl font-bold uppercase tracking-tight mb-4">Follow Us</h2>
        <p className="text-muted max-w-xl mx-auto mb-10 text-sm leading-relaxed">
          Stay updated with the newest games, hardware drops, and exclusive rental insights. Connect with us on social media!
        </p>

        <div className="flex justify-center items-center gap-6">
          {socials.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 bg-background border border-border rounded-full transition-colors flex items-center gap-2 group ${social.color}`}
              aria-label={`Follow us on ${social.name}`}
            >
              <div className="text-muted transition-colors group-hover:text-current">
                {social.icon}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
