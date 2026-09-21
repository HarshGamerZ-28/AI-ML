import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#080513",
        ink: "#f3effc",
        "ink-dim": "#b8aed4",
        "ink-faint": "#7b7199",
        rose: "#f8bcdc",
        lilac: "#c9b6ff",
        mint: "#aeead9",
        peach: "#ffdcae",
        violet: "#7b45ff",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        iris: "linear-gradient(105deg,#f8bcdc,#c9b6ff 36%,#aeead9 66%,#ffdcae)",
      },
    },
  },
  plugins: [],
};
export default config;
