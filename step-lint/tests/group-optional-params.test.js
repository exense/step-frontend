const { RuleTester } = require('@angular-eslint/test-utils');
const { rule, RULE_NAME, MESSAGE_IDS } = require('../rules/group-optional-params');

const tester = new RuleTester();

const VALID = [
  `
class Test {
  test1(x: number, y: number, foo?: string, bar?: string): void {
    
  }
  test2(x: number, y: number, params: {foo?: string, bar?: string, bazz?: string, bbb?: string} = {}): void {
    
  }
}
`,
  `
  function test1(x: number, y: number, foo?: string, bar?: string): void {
    
  }
  
  function test2(x: number, y: number, params: {foo?: string, bar?: string, bazz?: string, bbb?: string} = {}): void {
    
  }
`,
  `
  const test1 = (x: number, y: number, foo?: string, bar?: string) => {
    
  }
  
  const test2 = (x: number, y: number, params: {foo?: string, bar?: string, bazz?: string, bbb?: string} = {}) => {
    
  }
`,
  `
const obj = {
  test1: function(x: number, y: number, foo?: string, bar?: string): void {
  },
  test2: (x: number, y: number, params: {foo?: string, bar?: string, bazz?: string, bbb?: string} = {}) => {
  }
}
`,
  // Increase min optional parameters count for the last testcase
  `
class Test {
  test(x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string): void {
    
  }
}
`,
];

const INVALID = [
  `
class Test {
  test1(x: number, y: number, foo?: string, bar?: string): void {
    
  }
  test2(x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string): void {
    
  }
}
`,
  `
  function test1(x: number, y: number, foo?: string, bar?: string): void {
    
  }
  
  function test2(x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string): void {
    
  }
`,
  `
  const test1 = (x: number, y: number, foo?: string, bar?: string) => {
    
  }
  
  const test2 = (x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string) => {
    
  }
`,
  `
const obj = {
  test: function (x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string) {
  }
}
`,
  `
const obj = {
  test: (x: number, y: number, foo?: string, bar?: string, bazz?: string, bbb?: string) => {
  }
}
`,
  // Increase min optional parameters count for the last testcase
  `
class Test {
  test(x: number, y: number, foo?: string): void {
  }
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALID.map((code, i) => {
    const isLast = i === VALID.length - 1;
    const minOptionalParams = isLast ? 10 : 3;
    return { code, options: [{ minOptionalParams }] };
  }),
  invalid: INVALID.map((code, i) => {
    const isLast = i === INVALID.length - 1;
    const minOptionalParams = isLast ? 0 : 3;
    return {
      code,
      options: [{ minOptionalParams }],
      errors: [{ messageId: MESSAGE_IDS.groupOptionalParams }],
    };
  }),
});
