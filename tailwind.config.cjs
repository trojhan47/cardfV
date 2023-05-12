/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        getly: {
          DEFAULT: "#F5C045",
          background: "#FFFEFB",
          primary: "#F7C148",
          secondary: "#FFFAEB",
          yellow: "#F5C045",
          blue: "#4444EE",
          black: "#414040",
          red: "#F30505",
          gray: "#8E8E93",
          green: "#00FF00	"
        },
      },
      fontSize: {
        xxs: ["11px", "12px"],
      },
      fontFamily: {
        "museo-sans-rounded-100": ["Museo-Sans-Rounded-100"],
        "museo-sans-rounded-300": ["Museo-Sans-Rounded-300"],
        "museo-sans-rounded-500": ["Museo-Sans-Rounded-500"],
        "museo-sans-rounded-700": ["Museo-Sans-Rounded-700"],
      },
    },
  },
  plugins: [],
};
