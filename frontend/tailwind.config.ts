import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDFBF7',
        charcoal: '#2D3748',
        slate: '#4A5568',
        sage: '#81B29A',
        forest: '#6A9B84',
        marigold: '#F4A62A',
        'marigold-hover': '#DB9111',
        coral: '#C1440E',
        'card-border': '#EDEDE8',
        muted: '#F4F1DE',
        'accent-mint': '#B9FBC0',
        'accent-sky': '#A8DADC',
        'accent-peach': '#FFD6A5',
        'accent-lilac': '#CDB4DB',
        'accent-pink': '#FFC8DD',
        'accent-yellow': '#FFE66D',
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
} satisfies Config
