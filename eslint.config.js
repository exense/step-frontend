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
    ignores: [
      'projects/step-core/src/lib/client/generated/**/*',
      'projects/step-core/src/lib/client/ide-generated/**/*',
    ],
  },
  {
    files: [
      'projects/step-frontend/src/lib/modules/execution/components/alt-execution-progress/alt-execution-progress.component.ts',
    ],
    rules: {
      // This component is also provided as these services, so their contracts must remain public.
      'step-lint/component-public-fields': [
        'warn',
        {
          exclusions: [
            {
              interfaceName: 'AltExecutionStateService',
              exclusions: [
                'timeRangeSelection$',
                'timeRangeOptions',
                'executionId$',
                'execution$',
                'keywordParameters$',
                'keywordsDataSource$',
                'errors$',
                'availableErrorTypes$',
                'testCases$',
                'testCasesDataSource$',
                'testCasesTableParameters$',
                'testCasesDisplayMode$',
                'currentOperations$',
                'timeRange$',
                'treeInProgress$',
                'errorsDisplayInProgress$',
                'toggleTestCasesDisplayMode',
                'updateTimeRangeSelection',
                'selectFullRange',
              ],
            },
            { interfaceName: 'EntityRefService', exclusions: ['currentEntity'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      'projects/step-frontend/src/lib/modules/function/components/function-configuration-dialog/function-configuration-dialog.component.ts',
    ],
    rules: {
      // The form and keyword are exposed through FunctionTypeParentFormService.
      'step-lint/component-public-fields': [
        'warn',
        { exclusions: [{ interfaceName: 'FunctionTypeParentFormService', exclusions: ['keyword', 'formGroup'] }] },
      ],
    },
  },
  {
    files: ['projects/step-frontend/src/lib/modules/function/components/function-list/function-list.component.ts'],
    rules: {
      // DialogParentService consumers use these public members for navigation and refresh.
      'step-lint/component-public-fields': [
        'warn',
        {
          exclusions: [
            { interfaceName: 'DialogParentService', exclusions: ['returnParentUrl', 'dialogSuccessfullyClosed'] },
          ],
        },
      ],
    },
  },
  {
    files: ['projects/step-core/src/lib/modules/tree/components/tree/tree.component.ts'],
    rules: {
      // Parent plan and execution trees read menu state and invoke these child tree methods.
      'step-lint/component-public-fields': [
        'warn',
        {
          exclusions: [
            'openContextMenu',
            'openedMenuNodeId',
            'scrollToNode',
            {
              interfaceName: 'TreeNodeTemplateContainerService',
              exclusions: ['treeNodeTemplate', 'treeNodeNameTemplate', 'treeNodeDetailsTemplate'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'projects/step-frontend/src/lib/modules/timeseries/modules/filter-bar/components/ranger/ts-ranger.component.ts',
    ],
    rules: {
      // The time selection component drives its ranger through these methods.
      'step-lint/component-public-fields': ['warn', { exclusions: ['resizeChart', 'selectRange', 'resetSelect'] }],
    },
  },
  {
    files: [
      'projects/step-frontend/src/lib/modules/execution/components/execution-progress/execution-progress.component.ts',
    ],
    rules: {
      // Execution consumers inject these services from the component's providers.
      'step-lint/component-public-fields': [
        'warn',
        {
          exclusions: [
            {
              interfaceName: 'ExecutionStateService',
              exclusions: [
                'executionId',
                'testCasesProgress',
                'progress',
                'execution',
                'testCases',
                'testCasesDataSource',
                'setupTableSelectionList',
                'keywordSearch',
                'drillDownTestCase',
                'searchStepByError',
                'currentOperations',
                'countByErrorMsg',
                'errorDistribution',
                'countByErrorCode',
                'selectedErrorDistributionToggle',
                'showNodeInTree',
                'showTestCase',
              ],
            },
            { interfaceName: 'ExecutionCloseHandleService', exclusions: ['closeExecution'] },
            { interfaceName: 'EntityRefService', exclusions: ['currentEntity'] },
          ],
        },
      ],
    },
  },
  {
    files: ['projects/step-frontend/src/lib/modules/plan/components/plan-editor/plan-editor.component.ts'],
    rules: {
      // Scheduling and entity consumers inject these public service contracts.
      'step-lint/component-public-fields': [
        'warn',
        {
          exclusions: [
            { interfaceName: 'SchedulerInvokerService', exclusions: ['openScheduler'] },
            { interfaceName: 'EntityRefService', exclusions: ['currentEntity'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      'projects/step-frontend/src/lib/modules/plan/components/plan-list/plan-list.component.ts',
      'projects/step-frontend/src/lib/modules/scheduler/components/scheduled-task-list/scheduled-task-list.component.ts',
    ],
    rules: {
      // Dialog and scheduling services require these public members.
      'step-lint/component-public-fields': [
        'warn',
        {
          exclusions: [
            { interfaceName: 'DialogParentService', exclusions: ['returnParentUrl', 'dialogSuccessfullyClosed'] },
            { interfaceName: 'SchedulerInvokerService', exclusions: ['openScheduler'] },
          ],
        },
      ],
    },
  },
]);
