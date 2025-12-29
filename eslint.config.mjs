import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.{js,mjs,cjs,ts}'], plugins: { js, unusedImports }, extends: ['js/recommended'] },
  tseslint.configs.recommended,
  {
   'rules': {
    // "unused-imports/no-unused-imports": "error",
    // "simple-import-sort/imports": "error",
    // 'no-console': ['error', { 'allow': ['warn', 'error'] }],
    'no-console': 'off',
    'block-scoped-var': 'error',
    'eqeqeq': 'error',
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-multi-spaces': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'yoda': 'error',
    'no-shadow': 1,
    'no-undef-init': 'error',
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'no-array-constructor': 'error',
    'no-lonely-if': 'error',
    'no-multi-assign': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 0 }],
    'no-trailing-spaces': 'error',
    'no-unneeded-ternary': 'error',
    'no-whitespace-before-property': 'error',
    'operator-assignment': ['error', 'always'],
    'spaced-comment': ['error', 'always'],
    'no-confusing-arrow': ['error', { 'allowParens': true }],
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'quotes': ['error', 'single'], // ✅ Enforce single quotes
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': ['error', { 'object': true, 'array': true }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
     '@typescript-eslint/no-unused-vars': 'off',
     '@typescript-eslint/no-explicit-any': 'off',
     '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-dupe-else-if': 'off',
  },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'commitlint.config.ts',
      'commitlint.config.js'
    ],
  },
]);