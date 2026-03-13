const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/rx-nested-subscription');

const tester = new RuleTester();

const VALID = [
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
          // do something
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
          // do something
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
            // do something
          }
        });
  }
}
`,
];

const INVALID = [
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
           this._api
            .invokeAnother() 
            .subscribe((res) => {
                // do something 
            });
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
           this._api
            .invokeAnother() 
            .subscribe((res) => {
                // do something 
            });
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
           this._api
            .invokeAnother() 
            .subscribe((res) => {
                // do something 
            });
          }
        });
  }
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALID,
  invalid: [
    {
      code: INVALID[0],
      errors: [{ messageId: MESSAGE_IDS.subscribeInsideSubscribe }],
    },
    {
      code: INVALID[1],
      errors: [{ messageId: MESSAGE_IDS.subscribeInsideSubscribe }],
    },
    {
      code: INVALID[2],
      errors: [{ messageId: MESSAGE_IDS.subscribeInsideSubscribe }],
    },
  ],
});
