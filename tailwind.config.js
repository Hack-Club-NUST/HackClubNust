/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Mono"', 'monospace'],
        serif: ['"Space Mono"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
        display: ['"Anton SC"', 'sans-serif'],
      },
      colors: {
        ink: '#0B0507',
        brand: {
          coral: '#F26251',
          DEFAULT: '#ED4A52',
          crimson: '#EB4554',
          deep: '#C9303F',
        },
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #F26251 0%, #EB4554 100%)',
      },
    },
  },
  plugins: [],
}
