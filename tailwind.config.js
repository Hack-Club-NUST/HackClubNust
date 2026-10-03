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
      keyframes: {
        // the glow under the announcement bar, breathing
        glow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        // sweeps across in the first 60%, then rests off-screen until the next pass
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '60%, 100%': { transform: 'translateX(320%) skewX(-12deg)' },
        },
      },
      animation: {
        glow: 'glow 2.4s ease-in-out infinite',
        sheen: 'sheen 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
