const { RuleTester } = require('@angular-eslint/test-utils');
const { RULE_NAME, MESSAGE_IDS, rule } = require('../rules/underscore-injectable');

const tester = new RuleTester();

const VALIDS = [
  `
import { Component, inject } from '@angular/core';
import { ServiceA, ServiceB } from '../services';
@Component({
   selector: 'x', 
   template: '',
})
export class TestComponent {
  private readonly _serviceA = inject(ServiceA);
  private readonly _serviceB = inject(ServiceB);
}
`,
  `
import { Component, Inject } from '@angular/core';
import { ServiceA, ServiceB } from '../services';
@Component({
   selector: 'x', 
   template: '',
})
export class TestComponent {
  constructor(
    @Inject(ServiceA) private readonly _serviceA: ServiceA,
    @Inject(ServiceB) _serviceB: ServiceB
  ) {
  }
}
`,
  `
import { inject, InjectionToken } from '@angular/core';
import { ServiceA} from '../services';

export const SERVICE_DATA = new InjectionToken<unknown>('Service Data', {
  providedIn: 'root',
  factory: () => {
     const _serviceA = inject(ServiceA); 
     return _serviceA.getData();
  } 
});
`,
  `
const registerRoutes = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerRoutes({
    path: 'foo',
    component: FooComponent,
    canActivate: [
      () => {
         const _serviceA = inject(ServiceA);
         return _serviceA.checkAccess();
      }
    ] 
  });
}
`,
];

const INVALIDS = [
  `
import { Component, inject } from '@angular/core';
import { ServiceA, ServiceB } from '../services';
@Component({
   selector: 'x', 
   template: '',
})
export class TestComponent {
  private readonly serviceA = inject(ServiceA);
  private readonly serviceB = inject(ServiceB);
}
`,
  `
import { Component, Inject } from '@angular/core';
import { ServiceA, ServiceB } from '../services';
@Component({
   selector: 'x', 
   template: '',
})
export class TestComponent {
  constructor(
    @Inject(ServiceA) private readonly serviceA: ServiceA,
    @Inject(ServiceB) serviceB: ServiceB
  ) {
  }
}
`,
  `
import { inject, InjectionToken } from '@angular/core';
import { ServiceA} from '../services';

export const SERVICE_DATA = new InjectionToken<unknown>('Service Data', {
  providedIn: 'root',
  factory: () => {
     const serviceA = inject(ServiceA); 
     return serviceA.getData();
  } 
});
`,
  `
const registerRoutes = () => {
  const viewRegistry = inject(ViewRegistryService);
  viewRegistry.registerRoutes({
    path: 'foo',
    component: FooComponent,
    canActivate: [
      () => {
         const serviceA = inject(ServiceA);
         return serviceA.checkAccess();
      },
    ] 
  });
}
`,
];

tester.run(RULE_NAME, rule, {
  valid: VALIDS,
  invalid: [
    {
      code: INVALIDS[0],
      errors: [
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
      ],
    },
    {
      code: INVALIDS[1],
      errors: [
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
      ],
    },
    {
      code: INVALIDS[2],
      errors: [
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
      ],
    },
    {
      code: INVALIDS[3],
      errors: [
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
        {
          messageId: MESSAGE_IDS.noUnderscoreInInjectionName,
        },
      ],
    },
  ],
});
