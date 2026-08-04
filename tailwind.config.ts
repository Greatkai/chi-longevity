import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FB",
          100: "#DCE8F7",
          200: "#B9D1EE",
          300: "#8FB7E3",
          400: "#5D99D6",
          500: "#2E8BE6",
          600: "#0A6EC9",
          700: "#005BAC",
          800: "#004A8C",
          900: "#003A6E",
        },
        ink: {
          900: "#1F2A37",
          600: "#6B7280",
          400: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Noto Sans SC",
          "Helvetica Neue",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 91, 172, 0.08)",
        "card-hover": "0 12px 32px rgba(0, 91, 172, 0.16)",
        glow: "0 0 40px rgba(46, 139, 230, 0.35)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #003A6E 0%, #005BAC 45%, #2E8BE6 100%)",
        "brand-soft":
          "linear-gradient(135deg, #EEF4FB 0%, #FFFFFF 50%, #F4F7FB 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
