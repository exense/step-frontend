const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'boolean-conversion';
const MESSAGE_IDS = {
  booleanConversion: 'booleanConversion',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Force to use !! for boolean conversions.',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.booleanConversion]: 'Use !! syntax for boolean conversions.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node?.callee?.name === 'Boolean') {
          context.report({
            node,
            messageId: MESSAGE_IDS.booleanConversion,
          });
        }
      },
      NewExpression(node) {
        if (node?.callee?.name === 'Boolean') {
          context.report({
            node,
            messageId: MESSAGE_IDS.booleanConversion,
          });
        }
      },
    };
  },
});

module.exports = {
  RULE_NAME,
  MESSAGE_IDS,
  rule,
};
