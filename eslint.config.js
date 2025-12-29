// @ts-check
const angular = require('angular-eslint');
const { defineConfig } = require('eslint/config');
const typescriptEslint = require('typescript-eslint');
const stepLint = require('./step-lint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended, ...stepLint.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      'step-lint': stepLint,
      '@typescript-eslint': typescriptEslint.plugin,
    },
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
        },
      ],
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/no-output-on-prefix': 'warn',
      '@angular-eslint/no-output-native': 'warn',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: 'step',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'step',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...stepLint.configs.htmlRecommended],
    plugins: {
      'step-lint': stepLint,
    },
    rules: {
      '@angular-eslint/template/no-negated-async': 'off',
      '@angular-eslint/template/prefer-control-flow': 'error',
    },
  },
  {
    ignores: ['projects/step-core/src/lib/client/generated/**/*'],
  },
]);
