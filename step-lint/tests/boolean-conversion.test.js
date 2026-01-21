const { RuleTester } = require('@angular-eslint/test-utils');
const { rule, RULE_NAME, MESSAGE_IDS } = require('../rules/boolean-conversion');

const tester = new RuleTester();

const VALID = [
  `
function test(x: string): boolean {
  return !!x; 
}
`,
];

const INVALID = [
  `
function test(x: string): boolean {
  return Boolean(x); 
}
`,
  `
function test(x: string): boolean {
  return new Boolean(x); 
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALID,
  invalid: [
    {
      code: INVALID[0],
      errors: [
        {
          messageId: MESSAGE_IDS.booleanConversion,
        },
      ],
    },
    {
      code: INVALID[1],
      errors: [
        {
          messageId: MESSAGE_IDS.booleanConversion,
        },
      ],
    },
  ],
});
