/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--bg-primary))",
        card: "rgb(var(--bg-secondary))",
        foreground: "rgb(var(--text-primary))",
        muted: "rgb(var(--text-secondary))",
        accent: "rgb(var(--accent))",
        "accent-hover": "rgb(var(--accent-hover))",
        border: "rgb(var(--border))",
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
