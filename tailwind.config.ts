import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: "var(--bg-deep)",
        card: "var(--bg-card)",
        "neon-pink": "var(--neon-pink)",
        "neon-cyan": "var(--neon-cyan)",
        "neon-yellow": "var(--neon-yellow)",
        "neon-green": "var(--neon-green)",
        "neon-purple": "var(--neon-purple)",
      },
    },
  },
  plugins: [],
} satisfies Config;
