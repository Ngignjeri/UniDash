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
        brand: {
          50: "#fffbea",
          100: "#fff3c4",
          200: "#fce588",
          300: "#fadb5f",
          400: "#f7c948",
          500: "#f0b429", // primary yellow
          600: "#de911d",
          700: "#cb6e17",
          800: "#b44d12",
          900: "#8d2b0b",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#d9dde4",
          300: "#b8bfcb",
          400: "#8791a3",
          500: "#5d6880",
          600: "#444c61",
          700: "#333a4a",
          800: "#222834",
          900: "#141822",
        },
      },
    },
  },
  plugins: [],
};
export default config;
