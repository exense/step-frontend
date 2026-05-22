import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import { ViewRegistryService } from '@exense/step-core';
import { SandboxComponent } from './components/sandbox/sandbox.component';

const registerMenuEntries = (): void => {
  const _viewService = inject(ViewRegistryService);
  _viewService.registerMenuEntry('Sandbox', 'sandbox', 'hash', { weight: 101, parentId: 'automation-root' });
};

const registerViews = (): void => {
  const _viewService = inject(ViewRegistryService);
  _viewService.registerRoute({
    path: 'sandbox',
    component: SandboxComponent,
  });
};

export const SANDBOX_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerMenuEntries);
      runInInjectionContext(_injector, registerViews);
    };
  },
  multi: true,
};
