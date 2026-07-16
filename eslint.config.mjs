import { defineConfig, globalIgnores } from "eslint/config"
import nextPlugin from "@next/eslint-plugin-next"
import nextParser from "eslint-config-next/parser"

export default defineConfig([
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    languageOptions: {
      parser: nextParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        allowImportExportEverywhere: true,
        babelOptions: {
          presets: ["next/babel"],
          caller: { supportsTopLevelAwait: true },
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "**/* 2.*",
    "public/**",
    "content/posts/**",
    "app/fonts/**",
    "next-env.d.ts",
  ]),
])
