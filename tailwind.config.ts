import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#EB6708",
          apricot: "#FB9B3C",
          beige: "#ECECE2",
          sage: "#C1C8A9",
          forest: "#1B6648",
          surface: "#FFFFFF",
          border: "#DFDFD4",
        }
      }
    },
  },
  plugins: [],
};
export default config;
