import { APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from './shared';
import { STEP_CORE_JS } from './angularjs';

const addCoreAngularDependency = () => async () => {
  getAngularJSGlobal().module(AJS_MODULE).requires.push(STEP_CORE_JS);
};

export const CORE_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: addCoreAngularDependency,
  multi: true,
};
