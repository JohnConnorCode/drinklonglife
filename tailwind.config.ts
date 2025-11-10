import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (can be overridden via CSS variables from Sanity)
        'accent-primary': 'var(--accent-primary, #0f5348)',
        'accent-yellow': 'var(--accent-yellow, #d7f25c)',
        'accent-green': 'var(--accent-green, #8cbfa4)',
        'accent-cream': 'var(--accent-cream, #f0ecea)',
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-montserrat)', 'Montserrat', 'Futura', 'Futura PT', 'Century Gothic', 'Trebuchet MS', 'Arial', 'sans-serif'],
      },
      lineHeight: {
        'tight': '0.9',
      },
      spacing: {
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};

export default config;
