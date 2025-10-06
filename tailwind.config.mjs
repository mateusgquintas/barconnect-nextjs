/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        'input-background': 'var(--input-background)',
        'switch-background': 'var(--switch-background)',
        ring: 'var(--ring)',
        // Adicione outras variáveis se necessário
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  safelist: [
    'bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted', 'bg-destructive',
    'text-primary', 'text-secondary', 'text-accent', 'text-muted', 'text-destructive',
    'border-primary', 'border-secondary', 'border-accent', 'border-muted', 'border-destructive',
    'bg-background', 'text-foreground', 'bg-card', 'text-card-foreground',
    'bg-popover', 'text-popover-foreground',
    'bg-input', 'bg-input-background', 'bg-switch-background',
    'ring', 'outline-ring',
  ],
  plugins: [],
};
