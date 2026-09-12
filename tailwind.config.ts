import type { Config } from 'tailwindcss'

/**
 * Colours are declared as CSS custom properties in src/app/globals.css and
 * merely referenced here, so the locked palette lives in exactly one place.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        maroon: 'var(--maroon)',
        white: 'var(--white)',
        gold: {
          primary: 'var(--gold-primary)',
          deep: 'var(--gold-deep)',
          light: 'var(--gold-light)',
          pale: 'var(--gold-pale)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        13: '3.25rem',
        18: '4.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        marquee: 'marquee 38s linear infinite',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
