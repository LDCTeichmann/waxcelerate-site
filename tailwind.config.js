/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['Libre Franklin', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      // Semantic type scale (Workstream 2) — for the micro/label long-tail.
      // Coexists with Tailwind defaults; migrate ad-hoc text-[Npx] to these.
      fontSize: {
        'eyebrow': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.24em' }],
        'meta':    ['0.75rem',   { lineHeight: '1.45' }],   // 12px
        'small':   ['0.8125rem', { lineHeight: '1.55' }],   // 13px
        'body':    ['0.9375rem', { lineHeight: '1.6'  }],   // 15px
        'lead':    ['1.0625rem', { lineHeight: '1.6'  }],   // 17px
      },
      colors: {
        wx: {
          bg:   'var(--pg)',
          sf:   'var(--sf)',
          sf2:  'var(--sf2)',
          sf3:  'var(--sf3)',
          bd:   'var(--bd)',
          bd2:  'var(--bd2)',
          tx1:  'var(--tx1)',
          tx2:  'var(--tx2)',
          txm:  'var(--txm)',
          txf:  'var(--txf)',
          txff: 'var(--txff)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-ui))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
    },
  },
  plugins: [],
}