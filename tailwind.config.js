/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')


module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend:{
      colors: {
        spotifyGreen:'#1DB954',
      },
      keyframes:{
        'fade-in': {
          '0%':{
            opacity:'0',
          },
          '100%': {
            opacity: '1',
          }
        }
      },
      animation:{
        'fade-in': 'fade-in 1s ease-in'
      }
    }
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        ' .no-scrollbar::-webkit-scrollbar': {
            'display': 'none' /* Chrome, Safari, Opera */
        },
        '.no-scrollbar':{
          '-ms-overflow-style': 'none',  /* IE and Edge */
          'scrollbar-width': 'none',  /* Firefox */
        },
      })
    })
  ],
}