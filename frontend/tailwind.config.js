/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aldebaran: {
          dark0: 'var(--bg-base-darker)',
          dark: 'var(--bg-base)',
          gray: 'var(--bg-surface)',
          border: 'var(--border-subtle)',
          gold: 'var(--accent-gold)',
          goldDark: 'var(--accent-orange)',
          orange: 'var(--accent-orange)'
        },
        theme: {
          strong: 'var(--text-strong)',
          normal: 'var(--text-normal)',
          weak: 'var(--text-weak)',
        }
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        title: ['Libre Franklin', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
