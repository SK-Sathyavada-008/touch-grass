/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF9F5',
          100: '#F5F2EB',
          200: '#EBE5D8',
          300: '#DDD4C1',
        },
        forest: {
          50: '#E9EFEA',
          100: '#C7D7CB',
          200: '#A1BCA7',
          300: '#7BA083',
          500: '#3D6B49',
          700: '#23492F',
          800: '#1A3826',
          900: '#112519',
        },
        sage: {
          50: '#F2F6F3',
          100: '#E1ECE3',
          200: '#C3DAC7',
          300: '#A4C3A2',
          400: '#89AF87',
          500: '#7DA282',
        },
        sunshine: {
          100: '#FEF9E7',
          300: '#FDE68A',
          400: '#F4D06F',
          500: '#E9B44C',
        },
        clay: {
          bg: 'var(--clay-bg)',
          card: 'var(--clay-card)',
          border: 'var(--clay-border)',
          text: 'var(--clay-text)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['"Patrick Hand"', '"Comic Neue"', 'cursive'],
      },
      boxShadow: {
        'clay': 'inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 5px rgba(26,56,38,0.06), 4px 6px 14px -2px rgba(26,56,38,0.1)',
        'clay-hover': 'inset 2px 2px 6px rgba(255,255,255,0.9), inset -2px -2px 6px rgba(26,56,38,0.08), 6px 10px 20px -3px rgba(26,56,38,0.15)',
        'clay-pressed': 'inset 3px 3px 7px rgba(26,56,38,0.18), inset -2px -2px 4px rgba(255,255,255,0.7), 1px 2px 4px rgba(26,56,38,0.06)',
        'clay-card': 'inset 1px 1px 3px rgba(255,255,255,0.9), 6px 10px 24px -4px rgba(26,56,38,0.09), 0 2px 6px rgba(26,56,38,0.04)',
        'clay-floating': 'inset 1px 1px 3px rgba(255,255,255,0.95), 10px 18px 28px -5px rgba(26,56,38,0.14)',
        'clay-sun': '0 0 24px rgba(244, 208, 111, 0.45), inset 2px 2px 4px rgba(255,255,255,0.8)',
      },
      borderRadius: {
        'clay': '24px',
        'clay-lg': '32px',
        'clay-pill': '9999px',
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
        'flutter': 'flutter 2.5s ease-in-out infinite',
        'sway': 'sway 3.5s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        flutter: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
          '25%': { transform: 'translateY(-4px) rotate(3deg) scale(1.03)' },
          '75%': { transform: 'translateY(-2px) rotate(-3deg) scale(0.98)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.92)' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
