const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'template-name-inputs';

const MESSAGE_IDS = {
  templateNameInputs: 'template-name-inputs',
};

const hasInputDecorator = (node) => {
  return !!node?.decorators?.find((decorator) => {
    if (
      decorator?.expression?.type !== AST_NODE_TYPES.Identifier &&
      decorator?.expression?.type !== AST_NODE_TYPES.CallExpression
    ) {
      return false;
    }

    const callee =
      decorator?.expression?.type === AST_NODE_TYPES.CallExpression
        ? decorator?.expression?.callee
        : decorator?.expression;

    return callee.name === 'Input';
  });
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Show error when input parameter has templateRef type',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.templateNameInputs]: `Don't pass by templateRefs as inputs. Use contentChild / contentChildren instead`,
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

        let typeName = undefined;
        if (hasInputDecorator(node)) {
          typeName = node?.typeAnnotation?.typeAnnotation?.typeName?.name;
        } else if (node?.value?.type === AST_NODE_TYPES.CallExpression && node?.value?.callee?.name === 'input') {
          const inputType = node?.value?.typeArguments?.params?.[0];
          typeName = inputType?.typeName?.name;
        }

        if (typeName === 'TemplateRef') {
          context.report({
            node,
            messageId: MESSAGE_IDS.templateNameInputs,
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
