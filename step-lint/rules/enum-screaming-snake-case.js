const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'enum-screaming-snake-case';
const MESSAGE_IDS = {
  enumMemberInvalidFormat: 'enumMemberInvalidFormat',
};

const CHECK_REGEX = /^[A-Z0-9_]+$/;

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Forces enum members to be in SCREAMING_SNAKE_CASE format',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.enumMemberInvalidFormat]: `Use capital letters for enum member's case`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      TSEnumMember(node) {
        const name = node?.id?.name;
        if (!name || CHECK_REGEX.test(name)) {
          return;
        }
        context.report({
          node,
          messageId: MESSAGE_IDS.enumMemberInvalidFormat,
        });
      },
    };
  },
});

module.exports = {
  RULE_NAME,
  MESSAGE_IDS,
  rule,
};
