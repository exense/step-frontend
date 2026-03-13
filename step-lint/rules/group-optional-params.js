const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'group-optional-params';
const MESSAGE_IDS = {
  groupOptionalParams: 'groupOptionalParams',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Force to wrap many optional parameters into object',
      recommended: 'strict',
    },
    schema: [
      {
        type: 'object',
        properties: {
          minOptionalParams: {
            type: 'number',
          },
        },
        required: ['minOptionalParams'],
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.groupOptionalParams]: `Group optional parameters. Instead of 
      testFn(x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string): void, 
      use 
      testFn(x: number, y: number, params: {foo?: string, bar?: string, bazz?: string, bbb?: string} = {}): void,`,
    },
  },
  defaultOptions: [],
  create(context) {
    const [{ minOptionalParams }] = context.options;

    const checkParams = (node, params) => {
      const optionalParams = (params ?? []).filter((param) => !!param?.optional);
      if (optionalParams.length > minOptionalParams) {
        context.report({
          node,
          messageId: MESSAGE_IDS.groupOptionalParams,
        });
      }
    };

    return {
      FunctionExpression(node) {
        checkParams(node, node.params);
      },
      FunctionDeclaration(node) {
        checkParams(node, node.params);
      },
      ArrowFunctionExpression(node) {
        checkParams(node, node.params);
      },
    };
  },
});

module.exports = {
  RULE_NAME,
  MESSAGE_IDS,
  rule,
};
