const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');
const { getSubscriptionBlock, findSubscriptionArguments } = require('./rx-subscription-utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'rx-subscription-size';
const MESSAGE_IDS = {
  subscribeFunctionTooLarge: 'subscribeFunctionTooLarge',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Check subscription function sizes',
      recommended: 'strict',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maximumRowsCount: {
            type: 'number',
          },
        },
        required: ['maximumRowsCount'],
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.subscribeFunctionTooLarge]: `Subscription function's body is too large. Try to decouple logic and reduce the size down to {{count}} rows.`,
    },
  },
  defaultOptions: [],
  create(context) {
    const [{ maximumRowsCount }] = context.options;

    const source = context.getSourceCode().text;

    const checkArgument = (argument) => {
      const subscription = getSubscriptionBlock(argument);
      if (!subscription) {
        return;
      }
      const range = subscription.range;
      const codeBlock = source.slice(range[0], range[1]);
      const lines = codeBlock.split('\n');
      if (lines.length > maximumRowsCount) {
        context.report({
          node: argument,
          messageId: MESSAGE_IDS.subscribeFunctionTooLarge,
          data: {
            count: maximumRowsCount,
          },
        });
      }
    };

    return {
      Identifier(node) {
        const subscribeArguments = findSubscriptionArguments(node);
        const firstArgument = subscribeArguments?.[0];
        if (firstArgument) {
          checkArgument(firstArgument);
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
