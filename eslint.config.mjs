import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Gradual typing migration: allow legacy `any` until modules are refactored.
      "@typescript-eslint/no-explicit-any": "off",
      // Legacy content contains many apostrophes/quotes in JSX text.
      "react/no-unescaped-entities": "off",
      // Some UI hooks intentionally initialize state in effects.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "Cbt Management System/**",
    "app/cbt/User greeting/**",
  ]),
]);

export default eslintConfig;
