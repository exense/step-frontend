const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

module.exports = createRule({
  name: 'force-readonly-inputs',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forces to mark inputs/outputs as readonly',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      notReadonly: 'Mark input/outputs as readonly',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition(node) {
        if (node.value.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }
        if (node.value.callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        const name = node.value.callee.name;
        if ((name === 'input' || name === 'output') && !node.readonly) {
          context.report({
            node,
            messageId: 'notReadonly',
          });
        }
      },
    };
  },
});
