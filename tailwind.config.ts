import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0D0F1A",
        surface: "#1A1D2E",
        "surface-80": "rgba(26,29,46,0.8)",
        violet: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          light: "#67E8F9",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
        },
        text: {
          primary: "#FFFFFF",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #7C3AED, #06B6D4)",
        "gradient-accent-hover": "linear-gradient(135deg, #6D28D9, #0891B2)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glass: "0 4px 32px 0 rgba(0,0,0,0.37)",
        glow: "0 0 24px rgba(124,58,237,0.4)",
        "glow-cyan": "0 0 24px rgba(6,182,212,0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
