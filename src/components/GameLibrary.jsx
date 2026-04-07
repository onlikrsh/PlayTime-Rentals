import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function GameLibrary() {
  const games = [
    { id: 1, title: 'GRAND THEFT AUTO V', genre: 'ACTION / OPEN WORLD', img: 'https://steamcdn-a.akamaihd.net/steam/apps/271590/library_600x900_2x.jpg' },
    { id: 2, title: 'GOD OF WAR RAGNAROK', genre: 'ACTION RPG', img: 'https://steamcdn-a.akamaihd.net/steam/apps/2322010/library_600x900_2x.jpg' },
    { id: 3, title: 'EA SPORTS FC 25', genre: 'SPORTS', img: 'https://steamcdn-a.akamaihd.net/steam/apps/2669320/library_600x900_2x.jpg' },
    { id: 4, title: 'EA SPORTS F1 25', genre: 'RACING / SPORTS', img: '/f1-25.jpg' },
    { id: 5, title: 'MARVEL\'S SPIDER-MAN 2', genre: 'ACTION / ADVENTURE', img: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/1c7b75d8ed9271516546560d219ad0b22ee0a263b4537bd8.png?w=600' },
    { id: 6, title: 'GHOST OF TSUSHIMA', genre: 'HACK & SLASH', img: 'https://image.api.playstation.com/vulcan/ap/rnd/202106/2322/c16gs6a7lbAYzPf7ZTikbH1c.png?w=600' },
    { id: 7, title: 'ASSASSIN\'S CREED VALHALLA', genre: 'ACTION RPG', img: 'https://image.api.playstation.com/vulcan/ap/rnd/202007/0208/Ud7Ikvjoyev61bx3n1PTC9u8.png?w=600' },
    { id: 8, title: 'RED DEAD REDEMPTION', genre: 'OPEN WORLD / WILD WEST', img: 'https://steamcdn-a.akamaihd.net/steam/apps/2668510/library_600x900_2x.jpg' },
    { id: 9, title: 'IT TAKES TWO', genre: 'CO-OP PLATFORMER', img: 'https://image.api.playstation.com/vulcan/ap/rnd/202012/0815/7CRynuLSAb0vysSC4TmZy5e4.png?w=600' },
  ];

  return (
    <section id="game-library" className="py-20 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-bold text-muted tracking-[0.2em] mb-4">THE CATALOG</p>
            <h2 className="text-3xl font-bold uppercase tracking-tight">Game Library</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {games.map((game, idx) => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className={`relative aspect-[3/4] rounded-sm mb-4 bg-muted/10 border border-border flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:shadow-accent/20`}>
                {game.img ? (
                  <img src={game.img} alt={game.title} className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                ) : (
                  <span className="text-xs text-muted/50 font-medium tracking-widest uppercase px-4 text-center">
                    Cover Placeholder
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold tracking-wider leading-tight mb-1 line-clamp-2">{game.title}</h3>
              <p className="text-[10px] text-muted tracking-widest uppercase truncate">{game.genre}</p>
            </motion.div>
          ))}
          
          <motion.a 
            href="https://www.playstation.com/en-in/ps-plus/games/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: games.length * 0.1 }}
            className="group cursor-pointer block"
          >
            <div className={`relative aspect-[3/4] rounded-sm mb-4 bg-muted/10 border border-border flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:shadow-accent/20`}>
               {/* Background Image for 450+ Games using stylish controller photo */}
               <img src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600" alt="PS Plus Games" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 mix-blend-luminosity" />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
               
               <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8">
                 <span className="text-4xl font-bold text-white group-hover:text-accent transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">450+</span>
                 <span className="text-sm text-white mt-1 tracking-widest font-bold group-hover:text-accent transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">GAMES</span>
               </div>
            </div>
            <h3 className="text-sm font-bold tracking-wider leading-tight mb-1 text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              EXPLORE LIBRARY <ArrowUpRight className="w-3 h-3" />
            </h3>
          </motion.a>

        </div>

      </div>
    </section>
  );
}
