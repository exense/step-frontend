const { ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'track-is-item-field';

const MESSAGE_IDS = {
  trackIsNotItemField: 'trackIsNotItemField',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Check that track expression is a part of item',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.trackIsNotItemField]: `Track expression's value doesn't belong to the item's field or doesn't equal to item`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ForLoopBlock(node) {
        const name = node.item.name;
        const trackBy = node.trackBy.source;
        if (
          name === trackBy ||
          trackBy.startsWith(`${name}.`) ||
          trackBy.includes(`${name}[`) ||
          trackBy.includes(`(${name})[`)
        ) {
          return;
        }
        context.report({
          node,
          messageId: MESSAGE_IDS.trackIsNotItemField,
        });
      },
    };
  },
});

module.exports = { RULE_NAME, MESSAGE_IDS, rule };
