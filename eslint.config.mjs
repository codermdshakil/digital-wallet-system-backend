// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      // --- General JavaScript Rules ---
      "no-console": "warn", // প্রোডাকশনে console.log যেন না থাকে তাই ওয়ার্নিং দিবে
    
      // --- TypeScript Specific Rules ---
      "@typescript-eslint/no-explicit-any": "warn", // 'any' ব্যবহার করলে ওয়ার্নিং দিবে (টাইপ সেফটির জন্য)
    },
  },
   
);