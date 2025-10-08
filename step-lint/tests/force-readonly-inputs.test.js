const { RuleTester } = require('eslint');
const rule = require('../rules/force-readonly-inputs');

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

tester.run('force-readonly-inputs', rule, {
  valid: [
    `
      import { Component, input, output } from '@angular/core';
      @Component({selector: 'x', template: ''})
      export class C {
        readonly title = input<string>('');
        readonly saved = output<void>();
      }
    `,
  ],
  invalid: [
    {
      code: `
      import { Component, input, output } from '@angular/core';
      @Component({selector: 'x', template: ''})
      export class C {
        title = input<string>('');
        saved = output<void>();
      }`,
      errors: [{ messageId: 'notReadonly' }, { messageId: 'notReadonly' }],
      output: `
      import { Component, input, output } from '@angular/core';
      @Component({selector: 'x', template: ''})
      export class C {
        title = input<string>('');
        saved = output<void>();
      }`,
    },
  ],
});
