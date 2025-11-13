const { RuleTester } = require('@angular-eslint/test-utils');
const { rule, RULE_NAME, MESSAGE_IDS } = require('../rules/force-readonly-inputs');

const tester = new RuleTester();

const VALID = `
import { Component, input, output } from '@angular/core';
@Component({selector: 'x', template: ''})
export class C {
  readonly title = input<string>('');
  readonly saved = output<void>();
}
`;

const INVALID = `
import { Component, input, output } from '@angular/core';
@Component({selector: 'x', template: ''})
export class C {
  title = input<string>('');
  saved = output<void>();
}
`;

tester.run(RULE_NAME, rule, {
  valid: [VALID],
  invalid: [
    {
      code: INVALID,
      errors: [
        {
          messageId: MESSAGE_IDS.notReadonly,
        },
        {
          messageId: MESSAGE_IDS.notReadonly,
        },
      ],
    },
  ],
});
