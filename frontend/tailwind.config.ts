import type { Config } from "tailwindcss";
import themeTokens from "./tokens/theme.json";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Shadcn UI Design System Colors (CSS Variables)
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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

        // Semantic Colors (Novos)
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },

        // Dice Roll Colors
        dice: {
          critical: "hsl(var(--dice-critical))",
          "critical-bg": "hsl(var(--dice-critical-bg))",
          failure: "hsl(var(--dice-failure))",
          "failure-bg": "hsl(var(--dice-failure-bg))",
          normal: "hsl(var(--dice-normal))",
          "normal-bg": "hsl(var(--dice-normal-bg))",
        },

        // Dark Medieval Palette (Custom Theme)
        dark: {
          100: themeTokens.colors.dark["100"],
          300: themeTokens.colors.dark["300"],
          500: themeTokens.colors.dark["500"],
        },
        gold: {
          300: themeTokens.colors.gold["300"],
          500: themeTokens.colors.gold["500"],
          light: "hsl(var(--gold-light))",
          medium: "hsl(var(--gold-medium))",
          dark: "hsl(var(--gold-dark))",
          deep: "hsl(var(--gold-deep))",
        },
        silver: {
          light: "hsl(var(--silver-light))",
          medium: "hsl(var(--silver-medium))",
          dark: "hsl(var(--silver-dark))",
          deep: "hsl(var(--silver-deep))",
        },
        copper: {
          light: "hsl(var(--copper-light))",
          DEFAULT: "hsl(var(--copper))",
          dark: "hsl(var(--copper-dark))",
        },
        bronze: "hsl(var(--bronze))",
        text: {
          primary: themeTokens.colors.text.primary,
          secondary: themeTokens.colors.text.secondary,
        },
        ruby: themeTokens.colors.ruby,
        emerald: themeTokens.colors.emerald,
        arcane: themeTokens.colors.arcane,

        // Cores divertidas (Marca "Drogas")
        mischief: "#8B5CF6",        // Roxo travesso
        "dragon-fire": "#F97316",   // Laranja dramático
        "potion-green": "#10B981",  // Verde de poção
        "treasure-gold": "#FBBF24", // Dourado de tesouro

        // Horror Theme Colors
        horror: {
          purple: "hsl(var(--horror-purple))",    // Necrotic purple
          blood: "hsl(var(--horror-blood))",      // Blood red
          spectral: "hsl(var(--horror-spectral))", // Spectral green
          shadow: "hsl(var(--horror-shadow))",    // Deep shadow
        },

        // Legacy aliases (para compatibilidade)
        parchment: themeTokens.colors.text.primary,
        leather: themeTokens.colors.dark["300"],
        golden: themeTokens.colors.gold["500"],
        darkbg: themeTokens.colors.dark["100"],
      },
      fontFamily: {
        medieval: ["var(--font-medieval)", "Cinzel Decorative", "serif"],
        lore: ["var(--font-lore)", "Libre Baskerville", "serif"],
        ui: ["var(--font-ui)", "Inter", "sans-serif"],
        // Legacy alias
        narrative: ["var(--font-lore)", "Libre Baskerville", "serif"],
      },
      fontSize: {
        // Escala tipográfica semântica
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.15', letterSpacing: '0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],
        'h1': ['2.25rem', { lineHeight: '1.25', letterSpacing: '0.025em' }],
        'h2': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        'h3': ['1.5rem', { lineHeight: '1.35', letterSpacing: '0.02em' }],
        'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        'ui': ['1rem', { lineHeight: '1.5' }],
        'ui-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'DEFAULT': '0 2px 8px 0 rgba(0, 0, 0, 0.6)',
        'md': '0 4px 16px 0 rgba(0, 0, 0, 0.7)',
        'lg': '0 8px 24px 0 rgba(0, 0, 0, 0.8)',
        'xl': '0 16px 32px 0 rgba(0, 0, 0, 0.9)',
        // Sombras temáticas
        'glow': '0 0 15px hsl(var(--primary) / 0.5)',
        'glow-intense': '0 0 25px hsl(var(--primary) / 0.7)',
        'glow-soft': '0 0 10px hsl(var(--primary) / 0.3)',
        'arcane': '0 4px 20px hsl(var(--accent) / 0.4)',
        'arcane-intense': '0 8px 32px hsl(var(--accent) / 0.6)',
        'ruby': '0 4px 16px hsl(var(--destructive) / 0.5)',
        'emerald': '0 4px 16px hsl(var(--success) / 0.4)',
        // Horror shadows
        'horror': '0 4px 20px hsl(var(--horror-shadow) / 0.6), 0 8px 40px hsl(var(--horror-shadow) / 0.4)',
        'horror-purple': '0 0 15px hsl(var(--horror-purple) / 0.5), inset 0 0 10px hsl(var(--horror-purple) / 0.2)',
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'base': '300ms',
        'slow': '500ms',
        'slower': '700ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: themeTokens.spacing["card-radius"],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
