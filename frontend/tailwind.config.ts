import type { Config } from "tailwindcss";
import themeTokens from "./tokens/theme.json";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Medieval Palette
        dark: {
          100: themeTokens.colors.dark["100"],
          300: themeTokens.colors.dark["300"],
          500: themeTokens.colors.dark["500"],
        },
        gold: {
          300: themeTokens.colors.gold["300"],
          500: themeTokens.colors.gold["500"],
        },
        text: {
          primary: themeTokens.colors.text.primary,
          secondary: themeTokens.colors.text.secondary,
        },
        ruby: themeTokens.colors.ruby,
        emerald: themeTokens.colors.emerald,
        arcane: themeTokens.colors.arcane,
        border: themeTokens.colors.border,

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
      boxShadow: {
        glow: themeTokens.shadows.glow,
        "glow-intense": themeTokens.shadows["glow-intense"],
        arcane: themeTokens.shadows.arcane,
      },
      borderRadius: {
        card: themeTokens.spacing["card-radius"],
      },
    },
  },
  plugins: [],
};

export default config;
