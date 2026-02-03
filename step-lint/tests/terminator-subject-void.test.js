const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/terminator-subject-void');

const tester = new RuleTester();

const VALID = `
@Component({
  selector: 'test',
  templateUrl: 'test.html'
})
export class MyComponent {
  private terminator1$?: Subject<void>;
  private terminator2$ = new Subject<void>();

  test1(terminator3$: Subject<void>): void {
    let terminator4$: Subject<void> | undefined;
    const terminator5$ = new Subject<void>();
  }
  
  test2(terminator6$ = new Subject<void>): void {
  }
}
`;

const INVALID = `
@Component({
  selector: 'test',
  templateUrl: 'test.html'
})
export class MyComponent {
  private terminator1$?: Subject<unknown>;
  private terminator2$ = new Subject<unknown>();

  test1(terminator3$: Subject<unknown>): void {
    let terminator4$: Subject<unknown> | undefined;
    const terminator5$ = new Subject<unknown>();
  }
  
  test2(terminator6$ = new Subject<unknown>): void {
  }
}
`;

tester.run(RULE_NAME, rule, {
  valid: [VALID],
  invalid: [
    {
      code: INVALID,
      errors: [
        { messageId: MESSAGE_IDS.terminatorSubjectVoid },
        { messageId: MESSAGE_IDS.terminatorSubjectVoid },
        { messageId: MESSAGE_IDS.terminatorSubjectVoid },
        { messageId: MESSAGE_IDS.terminatorSubjectVoid },
        { messageId: MESSAGE_IDS.terminatorSubjectVoid },
        { messageId: MESSAGE_IDS.terminatorSubjectVoid },
      ],
    },
  ],
});
