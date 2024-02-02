import { APP_INITIALIZER, FactoryProvider } from '@angular/core';

const addCoreAngularDependency = () => async () => {
  return true;
};

export const CORE_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: addCoreAngularDependency,
  multi: true,
};
