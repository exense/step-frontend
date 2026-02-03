const { RuleTester } = require('@angular-eslint/test-utils');
const { rule, RULE_NAME, MESSAGE_IDS } = require('../rules/component-public-fields');

const tester = new RuleTester();

const VALID = [
  `
class Test {
  foo?: string;
  bar?: string;
  bazz?: string;
  test(): void {
    alert('test');
  }
}
`,
  `
@Component({
  selector: 'test-component',
  template: '' 
})  
class TestComponent implements OnInit, OnChanges, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy, ControlValueAccessor {
 
  private _someService = inject(SomeService);
  
  protected innerValue = signal('');
  
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
  }
  ngDoCheck(): void {
  }
  ngAfterContentInit(): void {
  }
  ngAfterContentChecked(): void {
  }
  ngAfterViewInit(): void {
  }
  ngAfterViewChecked(): void {
  }
  ngOnDestroy(): void {
  }
  writeValue(value?: any): void {
  }
  registerOnChange(changeFn: (value?: any) => void): void {
  }
  registerOnTouched(touchFn: () => void): void {
  }
  setDisabledState(disabled: boolean): void {
  }
}
`,
  `
@Component({
  selector: 'test-component',
  template: '' 
})  
class TestComponent {
  @Input() foo?: string;
  @Output() fooChange = new EventEmitter();
    
  readonly bar = input<string>();
  readonly barChange = output(); 
  
  readonly bazz = input.required();
  
  readonly aaa = model<string>();
  
  protected test(): void {
    alert('test');
  }
}
`,
];

const VALID_CUSTOM_EXCLUSIONS = {
  code: `
  @Component({
    selector: 'test-component',
    template: '' 
  })  
  class TestComponent implements ContextHolder<T> {
     context?: T;
     
     test(): void {
        alert('test');
     }
  }
  `,
  options: [
    {
      exclusions: [
        'test',
        {
          interfaceName: 'ContextHolder',
          exclusions: ['context'],
        },
      ],
    },
  ],
};

const INVALID = [
  `
@Component({
  selector: 'test-component',
  template: '' 
})  
class TestComponent {

  private _fb = inject(FormBuilder);
  protected text = '';
  
  foo?: string;
  bar?: string;
  bazz?: string;
  test(): void {
    alert('test');
  }
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: [...VALID, VALID_CUSTOM_EXCLUSIONS],
  invalid: [
    {
      code: INVALID[0],
      errors: [
        { messageId: MESSAGE_IDS.publicField },
        { messageId: MESSAGE_IDS.publicField },
        { messageId: MESSAGE_IDS.publicField },
        { messageId: MESSAGE_IDS.publicField },
      ],
    },
  ],
});
