import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function LegalPageLayout({ title, children }) {
  // Ensure we start at the top of the page when routed here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-muted hover:text-accent transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" /> BACK TO HOME
      </Link>
      
      <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-16">{title}</h1>
      
      <div className="prose prose-invert prose-p:text-muted prose-headings:text-foreground prose-a:text-accent hover:prose-a:text-accent-hover max-w-none">
        {children}
      </div>
    </div>
  );
}
