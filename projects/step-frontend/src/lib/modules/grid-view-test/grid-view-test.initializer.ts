import { inject, Injector, provideAppInitializer, runInInjectionContext } from '@angular/core';
import { ViewRegistryService } from '@exense/step-core';
import { GridViewTestComponent } from './components/grid-view-test/grid-view-test.component';

const registerRoutes = (): void => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerRoute({
    path: 'grid-view',
    component: GridViewTestComponent,
  });
};

export const GRID_VIEW_TEST_INITIALIZER = provideAppInitializer(() => {
  const _injector = inject(Injector);
  runInInjectionContext(_injector, registerRoutes);
});
