const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'redundant-if';

const MESSAGE_IDS = {
  redundantIf: 'redundantIf',
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Check fo if statements that can be simplified',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.redundantIf]: `This if statement can be simplified in a single line expression like obj?.member?.invoke.?()`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        if (node?.consequent?.body?.length !== 1 || !!node?.alternate) {
          return;
        }
        const bodyStatement = node.consequent.body[0];
        if (bodyStatement.type !== AST_NODE_TYPES.ExpressionStatement) {
          return;
        }
        const source = context.getSourceCode().text;
        const conditionText = source.slice(node.test.range[0], node.test.range[1]);
        if (conditionText.includes('&&') || conditionText.includes('||')) {
          return;
        }
        const bodyStatementText = source.slice(bodyStatement.range[0], bodyStatement.range[1]);
        const conditionTextEscaped = escapeRegex(conditionText);
        const conditionReplace = new RegExp(conditionTextEscaped, 'g');

        let replaceCount = 0;
        bodyStatementText.replace(conditionReplace, (match) => {
          replaceCount++;
          return '';
        });

        if (replaceCount === 0 || replaceCount > 1) {
          return;
        }

        const conditionRegexp = new RegExp(`${conditionTextEscaped}(\\.\\w+)*\\(`, 'g');
        if (conditionRegexp.test(bodyStatementText)) {
          context.report({
            node,
            messageId: MESSAGE_IDS.redundantIf,
          });
        }
      },
    };
  },
});

module.exports = { RULE_NAME, MESSAGE_IDS, rule };
