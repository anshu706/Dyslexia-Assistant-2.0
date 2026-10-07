/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        atkinson: ['"Atkinson Hyperlegible"', 'sans-serif'],
        opendyslexic: ['OpenDyslexic', 'Lexend', 'sans-serif'],
        sans: ['Lexend', 'system-ui', 'sans-serif'],
      },
      colors: {
        aurora: {
          bg: '#0b0f19',
          surface: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(51, 65, 85, 0.5)',
          cyan: '#06b6d4',
          violet: '#a855f7',
          text: '#f8fafc',
          muted: '#94a3b8',
        },
        mint: {
          bg: '#f4f8f6',
          surface: '#ffffff',
          border: '#e2e8f0',
          teal: '#0d9488',
          ocean: '#0284c7',
          highlight: '#e9f5db',
          text: '#0f172a',
          muted: '#64748b',
        },
        sunset: {
          bg: '#1e1028',
          surface: 'rgba(42, 23, 56, 0.8)',
          border: 'rgba(112, 48, 128, 0.4)',
          coral: '#f43f5e',
          amber: '#f59e0b',
          highlight: '#fef08a',
          text: '#fdf4ff',
          muted: '#d8b4fe',
        },
      },
      animation: {
        'float-slow': 'float 14s ease-in-out infinite',
        'float-reverse': 'floatRev 16s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(25px, -30px) scale(1.08)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-30px, 25px) scale(1.06)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
