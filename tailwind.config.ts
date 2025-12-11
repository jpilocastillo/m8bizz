import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
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
        // M8BS custom theme colors - Bright and vibrant theme
        "m8bs-bg": "#0a0a0f", // Slightly lighter black with blue tint
        "m8bs-card": "#111118", // Brighter dark for cards
        "m8bs-card-alt": "#000000", // Black for hover states
        "m8bs-border": "#2a2a3e", // Brighter border
        "m8bs-muted": "#b8c5e0", // Brighter muted text (light blue-grey)
        "m8bs-text": "#ffffff", // White text
        "m8bs-blue": "#4f9eff", // Brighter vibrant blue
        "m8bs-blue-dark": "#3b82f6", // Medium blue
        "m8bs-blue-light": "#6bb3ff", // Lighter bright blue
        "m8bs-accent": "#a855f7", // Bright purple accent
        "m8bs-cyan": "#22d3ee", // Bright cyan highlight
        "m8bs-purple": "#c084fc", // Bright purple highlight
        "m8bs-pink": "#f472b6", // Bright pink highlight
        "m8bs-green": "#34d399", // Bright green highlight
        "m8bs-orange": "#fb923c", // Bright orange highlight
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "blue-gradient": "linear-gradient(to right, #6b7280, #4b5563)",
        "dark-blue-gradient": "linear-gradient(to bottom, #1a1a1a, #000000)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
