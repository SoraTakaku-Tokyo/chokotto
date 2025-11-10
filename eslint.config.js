import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import airbnbBase from "eslint-config-airbnb-base";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["**/.next/**", "node_modules/**", "dist/**"]
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: { import: importPlugin },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...airbnbBase.rules
    }
  }
];
