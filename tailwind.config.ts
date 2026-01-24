import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6f03cd", // Brand purple
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ffd52a", // Brand yellow
          foreground: "#000000",
        },
        brand: {
          purple: "#6f03cd",
          yellow: "#ffd52a",
          white: "#ffffff",
        },
        purple: {
          50: "#f5e6ff",
          100: "#e6ccff",
          200: "#d4a6ff",
          300: "#be73ff",
          400: "#a640ff",
          500: "#6f03cd", // Brand purple
          600: "#5d02a8",
          700: "#4b0283",
          800: "#39015e",
          900: "#270139",
        },
        yellow: {
          50: "#fffce6",
          100: "#fff8cc",
          200: "#fff299",
          300: "#ffec66",
          400: "#ffe633",
          500: "#ffd52a", // Brand yellow
          600: "#ccaa22",
          700: "#99801a",
          800: "#665511",
          900: "#332b09",
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
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        headline: ["Barlow Condensed", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
