const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/template-ref-inputs');

const tester = new RuleTester();

const VALIDS = [
  `
@Component({
  selector: 'test',
  templateUrl: 'test.html'
})
export class MyComponent {
   private content = contentChild(MyComponentContent);
   protected readonly tplContent = computed(() => this.content()?._templateRef);
}
`,
];

const INVALIDS = [
  `
@Component({
  selector: 'test',
  templateUrl: 'test.html'
})
export class MyComponent {
  @Input() tplContent?: TemplateRef<unkonwn>;
}
`,
  `
@Component({
  selector: 'test',
  templateUrl: 'test.html'
})
export class MyComponent {
  readonly tplContent = input<TemplateRef<unkonwn>>(undefined);
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALIDS,
  invalid: [
    {
      code: INVALIDS[0],
      errors: [{ messageId: MESSAGE_IDS.templateNameInputs }],
    },
    {
      code: INVALIDS[1],
      errors: [{ messageId: MESSAGE_IDS.templateNameInputs }],
    },
  ],
});
