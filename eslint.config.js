import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import playwright from "eslint-plugin-playwright";
import { defineConfig } from "eslint/config";

export default defineConfig(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		...playwright.configs["flat/recommended"],
		files: ["**/*.spec.ts", "**/*.test.ts", "**/tests/**"],
	},
	prettierConfig,
);
