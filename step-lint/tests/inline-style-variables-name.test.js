const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/inline-style-variables-name');

const tester = new RuleTester();

const VALID = `
import { Component, input, output } from '@angular/core';
@Component({
   selector: 'x', 
   template: '',
   host: {
     '[style.--style__margin-left]': 'marginLeft()'
   }
})
export class C {
  readonly marginLeft = input<number>(0);
}
`;

const INVALID = `
import { Component, input, output } from '@angular/core';
@Component({
   selector: 'x', 
   template: '',
   host: {
     '[style.--marginLeft]': 'marginLeft()'
   }
})
export class C {
  readonly marginLeft = input<number>(0);
}
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
