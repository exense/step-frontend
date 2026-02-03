const { RuleTester } = require('@angular-eslint/test-utils');
const { rule, RULE_NAME, MESSAGE_IDS } = require('../rules/enum-screaming-snake-case');

const tester = new RuleTester();

const VALID = [
  `
  export enum TestEnum {
    FOO,
    BAR = 'bar',
    BAZZ = 'bazz',
    XXX_YYY = 'xxx yyy'
  }
`,
];

const INVALID = [
  `
  export enum TestEnum {
    foo,
    bar = 'bar',
    bazz = 'bazz',
    xxx_yyy = 'xxx yyy'
  }
`,
  `
  export enum TestEnum {
    foo,
    BAR = 'bar',
    bazz = 'bazz',
    XXX_YYY = 'xxx yyy'
  }
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALID,
  invalid: [
    {
      code: INVALID[0],
      errors: [
        { messageId: MESSAGE_IDS.enumMemberInvalidFormat },
        { messageId: MESSAGE_IDS.enumMemberInvalidFormat },
        { messageId: MESSAGE_IDS.enumMemberInvalidFormat },
        { messageId: MESSAGE_IDS.enumMemberInvalidFormat },
      ],
    },
    {
      code: INVALID[1],
      errors: [{ messageId: MESSAGE_IDS.enumMemberInvalidFormat }, { messageId: MESSAGE_IDS.enumMemberInvalidFormat }],
    },
  ],
});
