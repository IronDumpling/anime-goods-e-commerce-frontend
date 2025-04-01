/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Support dark mode
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
      },
    },
  },
};
  