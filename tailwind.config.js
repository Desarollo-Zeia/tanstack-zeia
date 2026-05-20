/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        border: '#E8E8E3',
        input: '#E8E8E3',
        ring: '#00B7CA',
        background: '#FAFAF5',
        foreground: '#1C1C1E',
        primary: {
          DEFAULT: '#00B7CA',
          hover: '#009EAE',
          light: '#E6F9FB',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5F5F0',
          foreground: '#4D5A63',
        },
        destructive: {
          DEFAULT: '#E71D36',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F5F0',
          foreground: '#8E8E93',
        },
        accent: {
          DEFAULT: '#E6F9FB',
          foreground: '#1C1C1E',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1C1E',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1C1E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#FAFAF5',
        },
        'text-primary': '#00B7CA',
        'text-secondary': '#4D5A63',
        'text-muted': '#8E8E93',
        success: '#2EC4B6',
        warning: '#FF6B35',
        danger: '#E71D36',
        info: '#00B7CA',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(0, 183, 202, 0.15)',
      },
      animation: {
        'count-up': 'countUp 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
