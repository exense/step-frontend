import { inject, Injector, provideAppInitializer, runInInjectionContext } from '@angular/core';
import { GridSettingsRegistryService, ViewRegistryService } from '@exense/step-core';
import { GridViewTestComponent } from './components/grid-view-test/grid-view-test.component';
import { GRID_TEST } from './shared/grid-test';

const registerRoutes = (): void => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerRoute({
    path: 'grid-view',
    component: GridViewTestComponent,
  });
};

const registerGridLayout = (): void => {
  const _gridSettings = inject(GridSettingsRegistryService);
  _gridSettings.register(GRID_TEST, {
    id: 'errorsWidget',
    title: 'Errors widget',
    widthInCells: 8,
    heightInCells: 1,
    weight: 1,
  });
  _gridSettings.register(GRID_TEST, {
    id: 'testCases',
    title: 'Test Cases',
    widthInCells: 6,
    heightInCells: 3,
    weight: 1,
  });
  _gridSettings.register(GRID_TEST, {
    id: 'testCasesSummary',
    title: 'Summary: Test Cases',
    widthInCells: 2,
    heightInCells: 3,
    weight: 1,
  });
  _gridSettings.register(GRID_TEST, {
    id: 'keywordsSummary',
    title: 'Summary: Keyword Calls',
    widthInCells: 2,
    heightInCells: 3,
    weight: 1,
  });
  _gridSettings.register(GRID_TEST, {
    id: 'keywordsList',
    title: 'Keywords',
    widthInCells: 6,
    heightInCells: 3,
    weight: 1,
  });
};

export const GRID_VIEW_TEST_INITIALIZER = provideAppInitializer(() => {
  const _injector = inject(Injector);
  runInInjectionContext(_injector, registerRoutes);
  runInInjectionContext(_injector, registerGridLayout);
});
