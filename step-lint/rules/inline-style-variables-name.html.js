const { ESLintUtils } = require('@typescript-eslint/utils');
const { MESSAGE_IDS } = require('./inline-style-variables-name');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'inline-style-variables-name';

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Forces to use --style__ prefix for inline css variables.',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.noStylePrefix]: 'Apply --style__ prefix',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Element(node) {
        const inputs = node.inputs ?? [];
        inputs.forEach((input) => {
          const attributeName = input?.keySpan?.details ?? '';
          if (attributeName.startsWith('style.--') && !attributeName.startsWith('style.--style__')) {
            context.report({
              node: input,
              messageId: MESSAGE_IDS.noStylePrefix,
            });
          }
        });
      },
    };
  },
});

module.exports = { rule, RULE_NAME, MESSAGE_IDS };
