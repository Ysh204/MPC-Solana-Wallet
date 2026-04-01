import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#b3d8ff",
          300: "#86c0ff",
          400: "#58a7ff",
          500: "#2a8eff",
          600: "#0d72e6",
          700: "#0758b4",
          800: "#073f80",
          900: "#072a55"
        },
        "electric-purple": "#aa3bff",
        "cyan-accent": "#00f0ff",
        "dark-bg": "#0d0d14",
        "indigo-bg": "#1a1a2e",
        "dark-surface": "rgba(26, 26, 46, 0.4)",
        "dark-border": "rgba(255, 255, 255, 0.08)",
        "text-primary": "#f8f8f8",
        "text-secondary": "#9ca3af",
      }
    }
  },
  plugins: []
} satisfies Config;
