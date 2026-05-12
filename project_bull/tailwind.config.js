/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        // Réduction proportionnelle des tailles de titres
        'xs':   ['0.65rem',  { lineHeight: '1rem' }],
        'sm':   ['0.75rem',  { lineHeight: '1.1rem' }],
        'base': ['0.85rem',  { lineHeight: '1.35rem' }],
        'lg':   ['0.95rem',  { lineHeight: '1.5rem' }],
        'xl':   ['1.05rem',  { lineHeight: '1.6rem' }],
        '2xl':  ['1.2rem',   { lineHeight: '1.75rem' }],
        '3xl':  ['1.4rem',   { lineHeight: '1.9rem' }],
        '4xl':  ['1.7rem',   { lineHeight: '2.1rem' }],
        '5xl':  ['2.1rem',   { lineHeight: '2.5rem' }],
        '6xl':  ['2.6rem',   { lineHeight: '3rem' }],
      },
    },
  },
  plugins: [],
};
