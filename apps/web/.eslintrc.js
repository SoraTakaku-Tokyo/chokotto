module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "react-hooks/exhaustive-deps": "warn",
  },
};