const { RuleTester } = require('@angular-eslint/test-utils');
const parser = require('@angular-eslint/template-parser');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/track-is-item-field.html');

const tester = new RuleTester({
  languageOptions: { parser },
});

const VALID = [
  `
<section>
  @for (item of items; track item.id) {
    <div>{{item.key}}</div>
    <div>{{item.value}}</div>
  }
</section>
`,
  `
<section>
  @for (item of items; track $any(item)[trackField]) {
    <div>{{item.key}}</div>
    <div>{{item.value}}</div>
  }
</section>
`,
  `
<section>
  @for (item of items; track item) {
    <div>{{item.key}}</div>
    <div>{{item.value}}</div>
  }
</section>
`,
];

const INVALID = [
  `
<section>
  @for (item of items; track trackByItemId) {
    <div>{{item.key}}</div>
    <div>{{item.value}}</div>
  }
</section>
`,
  `
<section>
  @for (item of items; track $index) {
    <div>{{item.key}}</div>
    <div>{{item.value}}</div>
  }
</section>
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALID,
  invalid: [
    {
      code: INVALID[0],
      errors: [{ messageId: MESSAGE_IDS.trackIsNotItemField }],
    },
    {
      code: INVALID[1],
      errors: [{ messageId: MESSAGE_IDS.trackIsNotItemField }],
    },
  ],
});
