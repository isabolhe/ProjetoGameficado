import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": "warn",          // ← avisa variáveis não usadas
      "no-unreachable": "warn",          // ← código depois de return
      "no-duplicate-case": "warn",
      "no-empty": "warn",
      "no-extra-semi": "warn",
      "no-duplicate-imports": "warn",
      "no-useless-return": "warn",
      "no-unused-labels": "warn",
      "no-self-assign": "warn",
      "no-else-return": "warn"
    },
  },
]);
