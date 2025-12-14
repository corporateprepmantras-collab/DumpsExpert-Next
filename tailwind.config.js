/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
      },
      colors: {
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        destructive: "rgb(var(--destructive))",
      },
    },
  },
  plugins: [],
};
