const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');
const { getSubscriptionBlock, findSubscriptionArguments } = require('./rx-subscription-utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'rx-nested-subscription';
const MESSAGE_IDS = {
  subscribeInsideSubscribe: 'subscribeInsideSubscribe',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Inform about subscribe invocations inside another subscribes',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.subscribeInsideSubscribe]: `Avoid to create subscriptions inside other subscriptions. Try to reorganize your chain with high order observable pipe operators.`,
    },
  },
  defaultOptions: [],
  create(context) {
    const source = context.getSourceCode().text;

    const checkArgument = (node, argument) => {
      const subscription = getSubscriptionBlock(argument);
      if (!subscription) {
        return;
      }
      const range = subscription.range;
      const codeBlock = source.slice(range[0], range[1]);
      if (codeBlock.includes('.subscribe(')) {
        context.report({
          node,
          messageId: MESSAGE_IDS.subscribeInsideSubscribe,
        });
      }
    };

    return {
      Identifier(node) {
        const subscribeArguments = findSubscriptionArguments(node);
        const firstArgument = subscribeArguments?.[0];
        if (firstArgument) {
          checkArgument(node, firstArgument);
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
