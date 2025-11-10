import type { Config } from "tailwindcss";

export default {
  content: ["./(app)/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jp: [
          // mac / iOS
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          // Windows
          '"Yu Gothic UI"',
          '"Yu Gothic"',
          '"Meiryo"',
          // Android / fallback
          '"Noto Sans JP"',
          "system-ui",
          "ui-sans-serif",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
} satisfies Config;
