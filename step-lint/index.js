const forceReadonlyInputs = require('./rules/force-readonly-inputs');
const inlineStyleVariablesName = require('./rules/inline-style-variables-name');
const inlineStyleVariablesNameHtml = require('./rules/inline-style-variables-name.html');
const underscoreInjectable = require('./rules/underscore-injectable');
const trackIsItemFiledHtml = require('./rules/track-is-item-field.html');
const redundantIf = require('./rules/redundant-if');
const templateRefInputs = require('./rules/template-ref-inputs');
const booleanConversion = require('./rules/boolean-conversion');

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
