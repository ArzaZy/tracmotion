import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#09090d", panel: "#121219", accent: "#9b7cff" } } },
  plugins: [],
};
export default config;
