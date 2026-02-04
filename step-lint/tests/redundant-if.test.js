const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/redundant-if');

const tester = new RuleTester();

const VALIDS = [
  `
class Test {
  constructor(
    private consumer?: Consumer,
  ) {
  }
  
  invoke(): void {
    this.consumer?.invoke?.();
  }
}
`,
  `
class Test {
  constructor(
    private consumer?: Consumer,
  ) {
  }
  
  invoke(check?: boolean): void {
    if (this.consumer && check) {
      this.consumer.invoke();
    }
  }
}
`,
  `
class Test {
  constructor(
    private consumer?: Consumer,
  ) {
  }
  
  invoke(check?: boolean): void {
    if (this.consumer || check) {
      this.consumer.invoke();
    }
  }
}
`,
  `
class Test {
  constructor(
    private consumer?: Consumer,
  ) {
  }
  
  invoke(): void {
    if (this.consumer) {
      console.log('BEFORE');
      this.consumer.invoke();
      console.log('AFTER');
    }
  }
}
`,
  `
class Test {
  constructor(
    private consumer?: ConsumerFn,
  ) {
  }
  
  invoke(): void {
    if (this.consumer) {
      this.consumer();
    } else {
      console.log('NO CONSUMER');
    }
  }
}
`,
  `
class Test {
  sortLegend() {
    if (this.legendSettings) {
      this.legendSettings.items = this.legendSettings.items.sort((a, b) => a.label.localeCompare(b.label));
    }
  }
}
`,
  `
class Test {
   private hasGrandParentPage = false;
   private moveUpIndex = 0;
   checkNode(grandParentChildrenBefore) {
        if (grandParentChildrenBefore) {
          while (nodesIndices[0]?.index === moveUpIndex) {
            const { node } = nodesIndices.shift()!;
            grandParentChildrenBefore.push(node);
            this.hasGrandParentChange = true;
            this.moveUpIndex++;
          }
        }
   }
}
`,
];

const INVALIDS = [
  `
class Test {
  constructor(
    private consumer?: Consumer,
  ) {
  }
  
  invoke(): void {
    if (this.consumer) {
      this.consumer.invoke();
    }
  }
}
`,
  `
class Test {
  constructor(
    private consumer?: ConsumerFn,
  ) {
  }
  
  invoke(): void {
    if (this.consumer) {
      this.consumer();
    }
  }
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALIDS,
  invalid: [
    {
      code: INVALIDS[0],
      errors: [{ messageId: MESSAGE_IDS.redundantIf }],
    },
    {
      code: INVALIDS[1],
      errors: [{ messageId: MESSAGE_IDS.redundantIf }],
    },
  ],
});
