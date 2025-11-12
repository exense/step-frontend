const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

module.exports = createRule({
  name: 'inline-style-variable-name',
  meta: {
    type: 'problem',
    docs: {
      description: 'Forces to use --style__ prefix for inline css variables.',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      noStylePrefix: 'Apply --style__ prefix',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node) {
        const decorators = node?.decorators ?? [];
        const componentOrDirectiveDecorator = decorators.find(
          (item) => item?.expression?.callee?.name === 'Component' || item?.expression?.callee?.name === 'Directive',
        );
        const decoratorData = componentOrDirectiveDecorator?.expression?.arguments?.[0];
        if (!decoratorData || decoratorData.type !== AST_NODE_TYPES.ObjectExpression) {
          return;
        }
        const hostProperty = decoratorData.properties.find((prop) => prop.key.name === 'host');
        if (!hostProperty || hostProperty?.value?.type !== AST_NODE_TYPES.ObjectExpression) {
          return;
        }
        const hostPropertyData = hostProperty.value.properties;
        hostPropertyData
          .filter((hostProp) => {
            const propKey = hostProp?.key?.value ?? '';
            return propKey.startsWith('[style.--') && !propKey.startsWith('[style.--style__');
          })
          .forEach((hostProp) =>
            context.report({
              node: hostProp,
              messageId: 'noStylePrefix',
            }),
          );
      },
    };
  },
});
