module.exports = {
  meta: {
    name: 'step-lint',
  },
  rules: {
    'force-readonly-inputs': require('./rules/force-readonly-inputs'),
  },
};
