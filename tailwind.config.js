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
      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(50px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'fade-out-right': {
          '0%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(50px)',
          },
        },
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
        'fade-out-right': 'fade-out-right 0.5s ease-in forwards',
      },
    },
  },
};
  