import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "black",
      {
        "dark": {
          "primary": "#818cf8",
          "secondary": "#c026d3",
          "accent": "#2dd4bf",
          "neutral": "#1e1e2f",
          "base-100": "#0f0f17",
          "base-200": "#151522",
          "base-300": "#222233",
          "info": "#38bdf8",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
        "midnight-glass": {
          "primary": "#818cf8",
          "secondary": "#c026d3",
          "accent": "#2dd4bf",
          "neutral": "#1e1e2f",
          "base-100": "#0f0f17",
          "base-200": "#151522",
          "base-300": "#222233",
          "info": "#38bdf8",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
      },
    ],
  },
};
