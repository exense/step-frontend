const { RuleTester } = require('@angular-eslint/test-utils');
const parser = require('@angular-eslint/template-parser');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/inline-style-variables-name.html');

const tester = new RuleTester({
  languageOptions: {
    parser,
  },
});

const VALID = `
<section>
  <div class="json-node" [class.additional-shift]="node.isParentIconExist" [style.--style__level]="node.level" (click)="displayNode(node)">
  </div>
</section>
`;

const INVALID = `
<section>
  <div class="json-node" [class.additional-shift]="node.isParentIconExist" [style.--level]="node.level" (click)="displayNode(node)">
  </div>
</section>
`;

tester.run(RULE_NAME, rule, {
  valid: [VALID],
  invalid: [
    {
      code: INVALID,
      errors: [
        {
          messageId: MESSAGE_IDS.noStylePrefix,
        },
      ],
    },
  ],
});
