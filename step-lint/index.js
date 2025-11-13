const forceReadonlyInputs = require('./rules/force-readonly-inputs');
const inlineStyleVariablesName = require('./rules/inline-style-variables-name');
const inlineStyleVariablesNameHtml = require('./rules/inline-style-variables-name.html');

module.exports = {
  meta: {
    name: 'step-lint',
  },
  rules: {
    [forceReadonlyInputs.RULE_NAME]: forceReadonlyInputs.rule,
    [inlineStyleVariablesName.RULE_NAME]: inlineStyleVariablesName.rule,
    [inlineStyleVariablesNameHtml.RULE_NAME]: inlineStyleVariablesNameHtml.rule,
  },
  configs: {
    tsRecommended: [
      {
        rules: {
          [`step-lint/${forceReadonlyInputs.RULE_NAME}`]: 'error',
          [`step-lint/${inlineStyleVariablesName.RULE_NAME}`]: 'error',
        },
      },
    ],
    htmlRecommended: [
      {
        rules: {
          [`step-lint/${inlineStyleVariablesNameHtml.RULE_NAME}`]: 'error',
        },
      },
    ],
  },
};
