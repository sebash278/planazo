/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e11d48',
          shade: '#be123c',
          tint: '#fb7185',
        },
        canvas: '#0d0e12',
        surface: {
          card: '#16181f',
          float: '#1f222c',
          inset: '#282c38',
        },
        outline: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          crimson: 'rgba(225, 29, 72, 0.4)',
        },
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
