import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: "#111827",
        surfaceHover: "#1f2937",
        border: "#1e293b",
        primary: "#6366f1",
        primaryHover: "#4f46e5",
        cyanAccent: "#06b6d4",
        textPrimary: "#f3f4f6",
        textSecondary: "#9ca3af",
        success: "#10b981",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-plex)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
