const { AST_NODE_TYPES } = require('@typescript-eslint/utils');

const findSubscriptionArguments = (node) => {
  if (node?.name !== 'subscribe') {
    return undefined;
  }
  if (node?.parent?.parent?.type !== AST_NODE_TYPES.CallExpression) {
    return undefined;
  }
  return node?.parent?.parent?.arguments;
};

const getSubscriptionBlock = (argument) => {
  if (argument.type === AST_NODE_TYPES.ArrowFunctionExpression || argument.type === AST_NODE_TYPES.FunctionExpression) {
    return argument;
  }
  if (argument.type === AST_NODE_TYPES.ObjectExpression) {
    const propNext = argument?.properties?.find?.((prop) => prop?.key?.name === 'next');
    return propNext?.value;
  }
  return undefined;
};

module.exports = {
  findSubscriptionArguments,
  getSubscriptionBlock,
};
