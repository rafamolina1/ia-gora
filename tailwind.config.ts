import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          overlay: "var(--bg-overlay)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
          ring: "var(--accent-ring)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      borderRadius: {
        xl: "16px",
      },
      boxShadow: {
        focus: "0 0 0 3px var(--accent-ring)",
      },
      maxWidth: {
        content: "560px",
        reading: "760px",
        wide: "1180px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
