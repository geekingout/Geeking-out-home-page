/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#5F2EEA',
        'brand-yellow': '#F5D324',
        'brand-lime': '#A3F953',
        'brand-red': '#FF4B4B',
        'brand-off-white': '#F8F8F8',
        'brand-black': '#1A1A1A',
        'brand-pink': '#FCE7F3',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 40s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'infinite-scroll': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
            'from': { opacity: 0 },
            'to': { opacity: 1 },
        },
        'scale-in': {
            'from': { transform: 'scale(0.95)', opacity: 0 },
            'to': { transform: 'scale(1)', opacity: 1 },
        },
        'blink': {
            'from, to': { borderColor: 'transparent' },
            '50%': { borderColor: 'currentColor' },
        }
      }
    },
  },
  plugins: [],
}