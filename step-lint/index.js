module.exports = {
  meta: {
    name: 'step-lint',
  },
  rules: {
    'force-readonly-inputs': require('./rules/force-readonly-inputs'),
    'inline-style-variables-name': require('./rules/inline-style-variables-name'),
  },
};
