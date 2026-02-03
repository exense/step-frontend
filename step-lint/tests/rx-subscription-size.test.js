const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/rx-subscription-size');

const tester = new RuleTester();

const EXAMPLES = [
  `
class Test {
  private _api = inject(ApiService);

  test(): void {
    this._api.invoke()
        .pipe(
          map((response) => response.data),
          catchError((err) => of(undefined))
        )
        .subscribe((result) => {
          const a = 'a';
          const b = 'b';
          const c = 'c';
          const d = 'd';
          const e = 'e';
        });
  }
}
`,
  `
class Test {
  private _api = inject(ApiService);

  test(): void {
    this._api.invoke()
        .pipe(
          map((response) => response.data),
          catchError((err) => of(undefined))
        )
        .subscribe(function (result) {
          const a = 'a';
          const b = 'b';
          const c = 'c';
          const d = 'd';
          const e = 'e';
        });
  }
}
`,
  `
class Test {
  private _api = inject(ApiService);

  test(): void {
    this._api.invoke()
        .pipe(
          map((response) => response.data),
          catchError((err) => of(undefined))
        )
        .subscribe({
          next: (result) => {
            const a = 'a';
            const b = 'b';
            const c = 'c';
            const d = 'd';
            const e = 'e';
          }
        });
  }
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: [
    {
      code: EXAMPLES[0],
      options: [{ maximumRowsCount: 10 }],
    },
    {
      code: EXAMPLES[1],
      options: [{ maximumRowsCount: 10 }],
    },
    {
      code: EXAMPLES[2],
      options: [{ maximumRowsCount: 10 }],
    },
  ],
  invalid: [
    {
      code: EXAMPLES[0],
      options: [{ maximumRowsCount: 5 }],
      errors: [{ messageId: MESSAGE_IDS.subscribeFunctionTooLarge }],
    },
    {
      code: EXAMPLES[1],
      options: [{ maximumRowsCount: 5 }],
      errors: [{ messageId: MESSAGE_IDS.subscribeFunctionTooLarge }],
    },
    {
      code: EXAMPLES[2],
      options: [{ maximumRowsCount: 5 }],
      errors: [{ messageId: MESSAGE_IDS.subscribeFunctionTooLarge }],
    },
  ],
});
