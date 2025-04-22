import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import { ErrorMessageHandlerService } from '@exense/step-core';
import { ErrorsService } from './injectables/errors.service';

const registerErrorHandlerStrategy = () => {
  const _errorHandlerService = inject(ErrorMessageHandlerService);
  const _errors = inject(ErrorsService);
  _errorHandlerService.useStrategy(_errors);
};

export const ERRORS_VIEW_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerErrorHandlerStrategy);
    };
  },
  multi: true,
};
