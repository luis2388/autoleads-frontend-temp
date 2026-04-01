/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        bg2: '#1a1d27',
        bg3: '#222537',
        border: '#2e3248',
        accent: '#6366f1',
        'accent-hover': '#818cf8',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};