// @ts-check

import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig(
  {
    files: ['plugins/**/*.{js,ts}', 'src/**/*.{js,ts}', 'Update.js', 'Plugins.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-undef': 'off',
      'no-unsafe-optional-chaining': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'no-unassigned-vars': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn'
    }
  },
  prettierConfig
)
