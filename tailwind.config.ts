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
        blush: {
          50: "#fff7f7",
          100: "#ffe8e8",
          200: "#ffd4d4",
          300: "#f9a9a9",
          400: "#f27f7f",
          500: "#eb5a5a",
          600: "#d73d3d",
        },
        rose: {
          50: "#fff5f7",
          100: "#ffe6ec",
          200: "#ffd6df",
          300: "#fcafc2",
          400: "#f48ca9",
          500: "#e86b8f",
          600: "#d34a75",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -15px rgba(231, 92, 128, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
