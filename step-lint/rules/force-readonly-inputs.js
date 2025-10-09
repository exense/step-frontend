const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

module.exports = createRule({
  name: 'force-readonly-inputs',
  meta: {
    type: 'problem',
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
        const parent = node?.parent?.parent;
        if (parent?.type !== AST_NODE_TYPES.ClassDeclaration) {
          return;
        }
        const decorators = parent?.decorators ?? [];
        const componentOrDirectiveDecorator = decorators.find(
          (item) => item?.expression?.callee?.name === 'Component' || item?.expression?.callee?.name === 'Directive',
        );
        if (!componentOrDirectiveDecorator) {
          return;
        }
        if (node?.value?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }
        let value = undefined;
        if (node?.value?.callee?.type === AST_NODE_TYPES.Identifier) {
          value = node?.value?.callee;
        } else if (node?.value?.callee?.type === AST_NODE_TYPES.MemberExpression) {
          value = node?.value?.callee?.object;
        }
        if (!value) {
          return;
        }
        const name = value?.name;
        if ((name === 'input' || name === 'output') && !node?.readonly) {
          context.report({
            node,
            messageId: 'notReadonly',
          });
        }
      },
    };
  },
});
