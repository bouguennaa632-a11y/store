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
        primary: "#ff4d94",    // الوردي
        secondary: "#1c74e9",  // الأزرق
        accent: "#ff4d94",     
        dark: "#0f1729",       // لون النص
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
export default config;