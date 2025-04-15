import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import { DashletRegistryService, ErrorMessageHandlerService, ViewRegistryService } from '@exense/step-core';
import { ErrorIconComponent } from './components/error-icon/error-icon.component';
import { ErrorsService } from './injectables/errors.service';

const registerDashlets = () => {
  const _dashletRegistry = inject(DashletRegistryService);
  const _viewRegistry = inject(ViewRegistryService);
  _dashletRegistry.registerDashlet('errorIcon', ErrorIconComponent);
  _viewRegistry.registerDashlet('menu/navbar/right', 'Errors', 'errorIcon', 'errors');
};

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
      runInInjectionContext(_injector, registerDashlets);
      runInInjectionContext(_injector, registerErrorHandlerStrategy);
    };
  },
  multi: true,
};
