import type { Linter } from 'eslint'
import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // Базовые правила ESLint
  js.configs.recommended,

  // Парсер Vue + TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // Интеграция Prettier в ESLint
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn', // Подсвечивать ошибки Prettier как ESLint-ошибки
    },
  },
] satisfies Linter.FlatConfig[]
