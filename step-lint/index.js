const forceReadonlyInputs = require('./rules/force-readonly-inputs');
const inlineStyleVariablesName = require('./rules/inline-style-variables-name');
const inlineStyleVariablesNameHtml = require('./rules/inline-style-variables-name.html');
const underscoreInjectable = require('./rules/underscore-injectable');
const trackIsItemFiledHtml = require('./rules/track-is-item-field.html');
const redundantIf = require('./rules/redundant-if');
const templateRefInputs = require('./rules/template-ref-inputs');
const booleanConversion = require('./rules/boolean-conversion');
const groupOptionalParams = require('./rules/group-optional-params');
const terminatorSubjectVoid = require('./rules/terminator-subject-void');
const enumScreamingSnakeCase = require('./rules/enum-screaming-snake-case');
const rxSubscriptionSize = require('./rules/rx-subscription-size');
const rxNestedSubscription = require('./rules/rx-nested-subscription');
const componentPublicFields = require('./rules/component-public-fields');

module.exports = {
  meta: {
    name: 'step-lint',
  },
  rules: {
    [forceReadonlyInputs.RULE_NAME]: forceReadonlyInputs.rule,
    [inlineStyleVariablesName.RULE_NAME]: inlineStyleVariablesName.rule,
    [inlineStyleVariablesNameHtml.RULE_NAME]: inlineStyleVariablesNameHtml.rule,
    [underscoreInjectable.RULE_NAME]: underscoreInjectable.rule,
    [trackIsItemFiledHtml.RULE_NAME]: trackIsItemFiledHtml.rule,
    [redundantIf.RULE_NAME]: redundantIf.rule,
    [templateRefInputs.RULE_NAME]: templateRefInputs.rule,
    [booleanConversion.RULE_NAME]: booleanConversion.rule,
    [groupOptionalParams.RULE_NAME]: groupOptionalParams.rule,
    [terminatorSubjectVoid.RULE_NAME]: terminatorSubjectVoid.rule,
    [enumScreamingSnakeCase.RULE_NAME]: enumScreamingSnakeCase.rule,
    [rxSubscriptionSize.RULE_NAME]: rxSubscriptionSize.rule,
    [rxNestedSubscription.RULE_NAME]: rxNestedSubscription.rule,
    [componentPublicFields.RULE_NAME]: componentPublicFields.rule,
  },
  configs: {
    tsRecommended: [
      {
        rules: {
          [`step-lint/${forceReadonlyInputs.RULE_NAME}`]: 'error',
          [`step-lint/${inlineStyleVariablesName.RULE_NAME}`]: 'error',
          [`step-lint/${underscoreInjectable.RULE_NAME}`]: 'error',
          [`step-lint/${redundantIf.RULE_NAME}`]: 'error',
          [`step-lint/${templateRefInputs.RULE_NAME}`]: 'error',
          [`step-lint/${booleanConversion.RULE_NAME}`]: 'error',
          [`step-lint/${groupOptionalParams.RULE_NAME}`]: ['error', { minOptionalParams: 3 }],
          [`step-lint/${terminatorSubjectVoid.RULE_NAME}`]: 'error',
          [`step-lint/${enumScreamingSnakeCase.RULE_NAME}`]: 'error',
          [`step-lint/${rxSubscriptionSize.RULE_NAME}`]: ['warn', { maximumRowsCount: 20 }],
          [`step-lint/${rxNestedSubscription.RULE_NAME}`]: 'error',
          [`step-lint/${componentPublicFields.RULE_NAME}`]: [
            'warn',
            {
              exclusions: [
                {
                  interfaceName: 'CustomComponent',
                  exclusions: ['context', 'contextChange'],
                },
                {
                  interfaceName: 'HasFilter',
                  exclusions: ['hasFilter$', 'hasFilter'],
                },
                {
                  interfaceName: 'TableHighlightItemContainer',
                  exclusions: ['highlightedItem'],
                },
                {
                  interfaceName: 'TableSearch',
                  exclusions: ['onSearch', 'getSearchValue$'],
                },
                {
                  interfaceName: 'TableFilter',
                  exclusions: ['getTableFilterRequest'],
                },
                {
                  interfaceName: 'Reloadable',
                  exclusions: ['reload'],
                },
                {
                  interfaceName: 'SelectionList',
                  exclusions: [
                    'selectAll',
                    'selectVisible',
                    'selectFiltered',
                    'clearSelection',
                    'select',
                    'deselect',
                    'toggleSelection',
                    'selectIds',
                    'checkCurrentSelectionState',
                  ],
                },
                {
                  interfaceName: 'TreeNodeTemplateContainerService',
                  exclusions: ['treeNodeTemplate', 'treeNodeNameTemplate', 'treeNodeDetailsTemplate'],
                },
                {
                  interfaceName: 'CustomColumnOptions',
                  exclusions: ['options$'],
                },
                {
                  interfaceName: 'CustomColumnsBaseComponent',
                  exclusions: ['colDef', 'colDefLabel', 'searchColDef', 'columnsReady$'],
                },
                {
                  interfaceName: 'ColumnContainer',
                  exclusions: ['initColumns'],
                },
                {
                  interfaceName: 'PlanEditorStrategy',
                  exclusions: [
                    'hasRedo',
                    'hasUndo',
                    'planContext',
                    'handlePlanContextChange',
                    'addControl',
                    'addKeywords',
                    'addPlans',
                    'undo',
                    'redo',
                    'discardAll',
                    'moveOut',
                    'moveUp',
                    'moveDown',
                    'moveInNextSibling',
                    'moveInPrevSibling',
                    'delete',
                    'copy',
                    'paste',
                    'pasteAfter',
                    'duplicate',
                    'rename',
                    'toggleSkip',
                    'init',
                  ],
                },
                {
                  interfaceName: 'TreeActionsService',
                  exclusions: ['getActionsForNode', 'hasActionsForNode'],
                },
                {
                  interfaceName: 'ArtefactContext',
                  exclusions: ['artefact', 'artefactChange$', 'readonly', 'save'],
                },
              ],
            },
          ],
        },
      },
    ],
    htmlRecommended: [
      {
        rules: {
          [`step-lint/${inlineStyleVariablesNameHtml.RULE_NAME}`]: 'error',
          [`step-lint/${trackIsItemFiledHtml.RULE_NAME}`]: 'error',
        },
      },
    ],
  },
};
