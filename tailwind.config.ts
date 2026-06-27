import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        line: "#d9e1ea",
        panel: "#f8fafc",
        brand: "#2563eb",
        success: "#12805c"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(24, 33, 47, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
