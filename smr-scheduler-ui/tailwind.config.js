/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aa: {
          yellow:     '#FFD200',
          'yellow-h': '#F0C600',  // hover
          'yellow-s': '#FFF8CC',  // soft bg tint
          dark:       '#1F1F1F',
          gray:       '#4B4B4B',
          'gray-mid': '#6B7280',
          'gray-soft':'#F5F5F5',
          border:     '#E5E7EB',
          white:      '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
        btn:  '8px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,.10)',
        nav:   '0 2px 8px rgba(0,0,0,.12)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
      },
    },
  },
  plugins: [],
}
