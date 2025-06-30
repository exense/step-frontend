import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  AugmentedResourcesService,
  BulkOperationType,
  checkEntityGuardFactory,
  CommonEntitiesUrlsService,
  dialogRoute,
  EntityBulkOperationsRegistryService,
  EntityRegistry,
  ResourcesService,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { ResourceSelectionComponent } from './components/resource-selection/resource-selection.component';
import { ResourcesListComponent } from './components/resources-list/resources-list.component';
import { ResourceConfigurationDialogComponent } from './components/resource-configuration-dialog/resource-configuration-dialog.component';
import { ActivatedRouteSnapshot } from '@angular/router';

const registerEntities = () => {
  const _entityRegistry = inject(EntityRegistry);
  _entityRegistry.register('resources', 'Resource', {
    icon: 'file-attachment-03',
    component: ResourceSelectionComponent,
  });
};

const registerRoutes = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerRoute({
    path: 'resources',
    component: ResourcesListComponent,
    children: [
      {
        path: 'editor',
        component: SimpleOutletComponent,
        children: [
          dialogRoute({
            path: 'new',
            dialogComponent: ResourceConfigurationDialogComponent,
          }),
          dialogRoute({
            path: ':id',
            dialogComponent: ResourceConfigurationDialogComponent,
            canActivate: [
              checkEntityGuardFactory({
                entityType: 'resource',
                getEntity: (id) => inject(AugmentedResourcesService).getResource(id),
                getEditorUrl: (id) => inject(CommonEntitiesUrlsService).resourceEditorUrl(id),
              }),
            ],
            resolve: {
              resource: (route: ActivatedRouteSnapshot) =>
                inject(AugmentedResourcesService).getResourceCached(route.params['id']),
            },
            canDeactivate: [
              () => {
                inject(AugmentedResourcesService).cleanupCache();
                return true;
              },
            ],
          }),
        ],
      },
    ],
  });
};

const registerMenuEntries = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerMenuEntry('Resources', 'resources', 'file-attachment-03', {
    weight: 50,
    parentId: 'automation-root',
  });
};

const registerBulkOperations = () => {
  const _entityBulOperationsRegister = inject(EntityBulkOperationsRegistryService);
  const _resourceApi = inject(ResourcesService);

  _entityBulOperationsRegister.register('resources', {
    type: BulkOperationType.DELETE,
    permission: 'resource-bulk-delete',
    operation: (requestBody) => _resourceApi.bulkDelete1(requestBody),
  });
};

export const RESOURCES_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerEntities);
      runInInjectionContext(_injector, registerRoutes);
      runInInjectionContext(_injector, registerMenuEntries);
      runInInjectionContext(_injector, registerBulkOperations);
    };
  },
  multi: true,
};
