import type { Config } from "tailwindcss";

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
        parchment: "#E8E6E1",
        leather: "#2A211B",
        golden: "#C5A75B",
        darkbg: "#121212",
      },
      fontFamily: {
        medieval: ["Cinzel", "serif"],
        narrative: ["Crimson Pro", "serif"],
      },
      boxShadow: {
        glow: "0 0 15px rgba(197, 167, 91, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
