import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        sand: {
          100: "#F3F3F0",
          140: "#efefeb",
          160: "#edede8",
          200: "#e8e8e3",
          300: "#deded5",
          400: "#d3d3c8",
          500: "#c8c8ba",
          600: "#bdbdad",
          700: "#b3b39f",
          800: "#a8a892",
          900: "#9d9d85",
        },
        secondary: "#f0f3f1",
        "secondary-c": "#657f6e",
        "scecondary-d": "#d4dcd7",
        linkedin: "#0a66c2",
        "light-gray": "#ededeb",
      },
    },
  },
};
export default config;
