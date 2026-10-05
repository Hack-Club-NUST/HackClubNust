/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // body copy below the hero. The hero inherits Space Mono from html/body + App.tsx and is unaffected.
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Space Mono"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
        display: ['"Anton SC"', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        // surfaces
        ink: '#0B0507',
        graphite: { DEFAULT: '#141316', 2: '#1B1A1E' },
        arcade: { DEFAULT: '#0C1216', 2: '#121A1F' },
        paper: { DEFAULT: '#F2EDE4', 2: '#E9E2D6', 3: '#DCD3C4' },
        // text on dark surfaces
        fg: { DEFAULT: '#F4F1EC', 2: '#A39F99', 3: '#8A857F' },
        // text on paper
        pen: { DEFAULT: '#141114', 2: '#4F4A45', 3: '#6E6861' },
        // hairlines
        line: {
          DEFAULT: 'rgba(244,241,236,0.12)',
          strong: 'rgba(244,241,236,0.24)',
          paper: 'rgba(20,17,20,0.14)',
          'paper-strong': 'rgba(20,17,20,0.32)',
        },
        // the signature, unchanged
        brand: {
          coral: '#F26251',
          DEFAULT: '#ED4A52',
          crimson: '#EB4554',
          deep: '#C9303F',
        },
        // the cool accent
        signal: { DEFAULT: '#58E0D8', deep: '#106B66' },
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #F26251 0%, #EB4554 100%)',
        // left-to-right scrim for text over full-bleed art (Chapter)
        'scrim-x': 'linear-gradient(90deg, #0B0507 0%, rgba(11,5,7,0.82) 45%, rgba(11,5,7,0.2) 100%)',
        // the hero's vignette, reusable
        vignette: 'radial-gradient(ellipse at center, rgba(11,5,7,0.30) 0%, rgba(11,5,7,0.85) 100%)',
      },
      boxShadow: {
        'glow-brand': '0 8px 30px rgba(235,69,84,0.32)',
        led: '0 0 0 3px rgba(237,74,82,0.18), 0 0 12px rgba(237,74,82,0.6)',
        'glow-signal': '0 0 0 1px rgba(88,224,216,0.25), 0 0 40px rgba(88,224,216,0.12)',
      },
      letterSpacing: {
        kicker: '0.22em',
      },
      keyframes: {
        // existing — the announcement bar
        glow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '60%, 100%': { transform: 'translateX(320%) skewX(-12deg)' },
        },
        // new — shared
        led: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'crt-on': {
          '0%': { transform: 'scaleY(0.004)', opacity: '1', filter: 'brightness(3)' },
          '60%': { transform: 'scaleY(1.02)', filter: 'brightness(1.4)' },
          '100%': { transform: 'scaleY(1)', filter: 'brightness(1)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' },
        },
      },
      animation: {
        glow: 'glow 2.4s ease-in-out infinite',
        sheen: 'sheen 4.5s ease-in-out infinite',
        led: 'led 2.4s ease-in-out infinite',
        blink: 'blink 1s steps(1) infinite',
        scanline: 'scanline 6s linear infinite',
        'crt-on': 'crt-on 450ms cubic-bezier(0.77, 0, 0.175, 1) both',
        sway: 'sway 5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        inout: 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}
