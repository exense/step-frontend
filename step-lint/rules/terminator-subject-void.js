const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'terminator-subject-void';
const MESSAGE_IDS = {
  terminatorSubjectVoid: 'terminatorSubjectVoid',
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Force to use Subject<void> for terminations subjects',
      recommended: 'strict',
    },
    schema: [],
    messages: {
      [MESSAGE_IDS.terminatorSubjectVoid]: `Use Subject<void> for termination subject`,
    },
  },
  defaultOptions: [],
  create(context) {
    const addError = (node) => context.report({ node, messageId: MESSAGE_IDS.terminatorSubjectVoid });

    const isTerminator = (name) => (name ?? '').toLowerCase().includes('terminator');

    const isSubject = (nameIdentifier) =>
      nameIdentifier?.type === AST_NODE_TYPES.Identifier && nameIdentifier.name === 'Subject';

    const isSubjectVoid = (nameIdentifier, typeArguments) => {
      if (!isSubject(nameIdentifier)) {
        return false;
      }
      if (typeArguments.type !== AST_NODE_TYPES.TSTypeParameterInstantiation) {
        return false;
      }
      return typeArguments?.params?.length === 1 && typeArguments?.params?.[0]?.type === AST_NODE_TYPES.TSVoidKeyword;
    };

    const findTerminatorParam = (params) =>
      (params ?? []).find((param) => {
        let name = '';
        switch (param.type) {
          case AST_NODE_TYPES.Identifier:
            name = param.name;
            break;
          case AST_NODE_TYPES.AssignmentPattern:
            name = param.left.name;
            break;
          default:
            break;
        }
        return isTerminator(name);
      });

    const checkTypeAnnotation = (node, typeAnnotation) => {
      if (typeAnnotation?.type !== AST_NODE_TYPES.TSTypeAnnotation) {
        return;
      }

      let isCorrectType = false;

      const type = typeAnnotation?.typeAnnotation;
      if (!!type) {
        if (type.type === AST_NODE_TYPES.TSUnionType) {
          const types = type.types ?? [];
          isCorrectType = types.some((type) => isSubjectVoid(type?.typeName, type?.typeArguments));
        } else {
          isCorrectType = isSubjectVoid(type?.typeName, type?.typeArguments);
        }
      }

      if (!isCorrectType) {
        addError(node);
      }
    };

    const checkParams = (node, params) => {
      const terminatorParam = findTerminatorParam(params);
      if (!terminatorParam) {
        return;
      }
      if (terminatorParam.type === AST_NODE_TYPES.Identifier) {
        checkTypeAnnotation(terminatorParam, terminatorParam.typeAnnotation);
        return;
      }
      if (terminatorParam.type === AST_NODE_TYPES.AssignmentPattern) {
        if (!isSubjectVoid(terminatorParam.right.callee, terminatorParam.right.typeArguments)) {
          addError(terminatorParam);
        }
        return;
      }
      addError(terminatorParam);
    };

    return {
      PropertyDefinition(node) {
        if (!isTerminator(node?.key?.name)) {
          return;
        }

        if (!!node.typeAnnotation) {
          checkTypeAnnotation(node, node.typeAnnotation);
          return;
        }
        if (!!node.value && isSubjectVoid(node.value?.callee, node.value?.typeArguments)) {
          return;
        }
        addError(node);
      },
      VariableDeclarator(node) {
        if (!isTerminator(node?.id?.name)) {
          return;
        }
        if (!!node.id?.typeAnnotation) {
          checkTypeAnnotation(node, node.id?.typeAnnotation);
          return;
        }
        if (!!node.init && isSubjectVoid(node.init?.callee, node.init?.typeArguments)) {
          return;
        }
        addError(node);
      },
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
