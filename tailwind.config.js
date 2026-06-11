/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display:         ['Fraunces', 'Georgia', 'serif'],
        sans:            ['Libre Franklin', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        roboto:          ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'serif-display': ['Fraunces', 'Georgia', 'serif'],
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
          DEFAULT: "hsl(var(--accent))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}