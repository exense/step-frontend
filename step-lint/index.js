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
