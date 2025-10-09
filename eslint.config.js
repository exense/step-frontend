// @ts-check
const angular = require('angular-eslint');
const { defineConfig } = require('eslint/config');
const stepLint = require('./step-lint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: {
      stepLint,
    },
    rules: {
      'stepLint/force-readonly-inputs': 'warn',
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
    extends: [...angular.configs.templateRecommended],
    rules: {
      '@angular-eslint/template/no-negated-async': 'off',
    },
  },
  {
    ignores: ['projects/step-core/src/lib/client/generated/**/*'],
  },
]);
