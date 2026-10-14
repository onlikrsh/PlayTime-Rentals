import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

// Check initial preference
const getInitialDark = () => {
  try {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    // Haptic feedback (5ms as specified)
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }

    try {
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    } catch {
      // Storage blocked (private mode): the theme just won't be remembered.
    }
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-foreground" />
      ) : (
        <Moon className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
}
