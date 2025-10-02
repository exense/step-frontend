import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { RuleMetaDataDocs } from '@typescript-eslint/utils/dist/ts-eslint';

const createRule = ESLintUtils.RuleCreator<RuleMetaDataDocs>((name) => '');

export const rule = createRule({
  name: 'force-readonly-inputs',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forces to mark inputs/outputs as readonly',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      notReadonly: 'Mark input/outputs as readonly',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition(node) {
        if (node.value.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }
        if (node.value.callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        const name = node.value.callee.name;
        if ((name === 'input' || name === 'output') && !node.readonly) {
          context.report({
            node,
            messageId: 'notReadonly',
          });
        }
      },
    };
  },
});
