const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'underscore-injectable';
const MESSAGE_IDS = {
  noUnderscoreInInjectionName: 'noUnderscoreInInjectionName',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Forces to use _ for injected fields and variables.',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.noUnderscoreInInjectionName]: 'Injection name not started with _',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition(node) {
        if (node?.value?.callee?.name !== 'inject') {
          return;
        }
        const name = node?.key?.name;
        if (!!name && !name.startsWith('_')) {
          context.report({
            node,
            messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
          });
        }
      },
      ClassDeclaration(node) {
        const body = node?.body?.body ?? [];
        const ctor = body.find(
          (item) => item?.type === AST_NODE_TYPES.MethodDefinition && item?.key?.name === 'constructor',
        );
        if (!ctor) {
          return;
        }
        const injectedParams = (ctor?.value?.params ?? []).filter((param) =>
          (param?.decorators ?? []).some((decorator) => decorator?.expression?.callee?.name === 'Inject'),
        );
        injectedParams.forEach((param) => {
          if (param?.type === AST_NODE_TYPES.TSParameterProperty) {
            param = param.parameter;
          }
          if (!!param?.name && !param.name.startsWith('_')) {
            context.report({
              node: param,
              messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
            });
          }
        });
      },
      VariableDeclarator(node) {
        if (node?.init?.callee?.name !== 'inject') {
          return;
        }
        const name = node?.id?.name;
        if (!!name && !name.startsWith('_')) {
          context.report({
            node: node,
            messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
          });
        }
      },
    };
  },
});

module.exports = { rule, RULE_NAME, MESSAGE_IDS };
