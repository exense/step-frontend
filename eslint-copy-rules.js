const shell = require('shelljs');

const copyLinkRules = () => {
  shell.cp('-R', './step-lint', './dist/step-core/step-lint');
};

copyLinkRules();
