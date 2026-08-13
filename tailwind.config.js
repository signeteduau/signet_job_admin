/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        card: "rgb(var(--card))",
        "card-foreground": "rgb(var(--card-foreground))",
        border: "rgb(var(--border))",
        muted: "rgb(var(--muted))",
        "muted-foreground": "rgb(var(--muted-foreground))",
        primary: "rgb(var(--primary))",
        "primary-foreground": "rgb(var(--primary-foreground))",
      }
    },
  },
  plugins: [],
};
