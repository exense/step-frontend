import { TSESLint } from '@typescript-eslint/utils';
import { rule } from '../rules/force-readonly-inputs';

const tester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
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
