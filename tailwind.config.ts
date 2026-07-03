import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.ts', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        method: {
          get: '#22c55e',
          post: '#3b82f6',
          put: '#f59e0b',
          patch: '#a855f7',
          delete: '#ef4444',
          head: '#6b7280',
          options: '#6b7280',
        },
        surface: {
          primary: 'var(--sx-surface-primary)',
          secondary: 'var(--sx-surface-secondary)',
          tertiary: 'var(--sx-surface-tertiary)',
          card: 'var(--sx-surface-card)',
          'card-hover': 'var(--sx-surface-card-hover)',
        },
        text: {
          primary: 'var(--sx-text-primary)',
          secondary: 'var(--sx-text-secondary)',
          muted: 'var(--sx-text-muted)',
        },
        border: {
          DEFAULT: 'var(--sx-border)',
          subtle: 'var(--sx-border-subtle)',
        },
        accent: {
          DEFAULT: 'var(--sx-accent)',
          hover: 'var(--sx-accent-hover)',
          'bg-subtle': 'var(--sx-accent-bg-subtle)',
        },
      },
      boxShadow: {
        sm: 'var(--sx-shadow-sm)',
        md: 'var(--sx-shadow-md)',
        card: 'var(--sx-shadow-card)',
      },
      borderRadius: {
        sm: 'var(--sx-radius-sm)',
        md: 'var(--sx-radius-md)',
        lg: 'var(--sx-radius-lg)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
