import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        njord: {
          50: '#edfffe',
          100: '#c0fffc',
          200: '#81fef9',
          300: '#3afbf5',
          400: '#0ce5e1',
          500: '#00c9c7',
          600: '#009fa1',
          700: '#047e81',
          800: '#0a6367',
          900: '#0d5255',
          950: '#003234',
        },
        surface: {
          950: '#0b1120',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
