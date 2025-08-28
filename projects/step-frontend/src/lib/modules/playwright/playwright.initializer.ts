import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import { ViewRegistryService } from '@exense/step-core';
import { PlaywrightPageComponent } from './components/playwright-page/playwright-page.component';

const registerRoutes = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerRoute({
    path: 'playwright-trace-viewer',
    component: PlaywrightPageComponent,
  });
};

const registerMenuEntries = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerMenuEntry('Trace Viewer', 'playwright-trace-viewer', 'playwright', {
    weight: 50,
    parentId: 'execute-root',
  });
};

export const PLAYWRIGHT_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerRoutes);
      runInInjectionContext(_injector, registerMenuEntries);
    };
  },
  multi: true,
};
