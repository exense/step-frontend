const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'force-readonly-inputs';
const MESSAGE_IDS = {
  notReadonly: 'notReadonly',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Forces to mark inputs/outputs as readonly',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.notReadonly]: 'Mark input/outputs as readonly',
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
            messageId: MESSAGE_IDS.notReadonly,
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
