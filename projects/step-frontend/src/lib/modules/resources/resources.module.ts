import { inject, NgModule } from '@angular/core';
import {
  AugmentedResourcesService,
  checkProjectGuardFactory,
  CommonEditorUrlsService,
  dialogRoute,
  EntityRegistry,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { ResourceConfigurationDialogComponent } from './components/resource-configuration-dialog/resource-configuration-dialog.component';
import './components/resource-selection/resource-selection.component';
import { ResourceSelectionComponent } from './components/resource-selection/resource-selection.component';
import { ResourcesListComponent } from './components/resources-list/resources-list.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ResourceUrlPipe } from './pipes/resource-url.pipe';

@NgModule({
  imports: [StepCoreModule],
  declarations: [
    ResourceSelectionComponent,
    ResourcesListComponent,
    ResourceConfigurationDialogComponent,
    ResourceUrlPipe,
  ],
  exports: [ResourceSelectionComponent, ResourcesListComponent, ResourceConfigurationDialogComponent],
})
export class ResourcesModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _viewRegistry: ViewRegistryService,
  ) {
    this.registerEntities();
    this.registerMenuEntries();
    this.registerRoutes();
  }

  private registerMenuEntries(): void {
    this._viewRegistry.registerMenuEntry('Resources', 'resources', 'file-attachment-03', {
      weight: 50,
      parentId: 'automation-root',
    });
  }

  private registerRoutes(): void {
    this._viewRegistry.registerRoute({
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
                checkProjectGuardFactory({
                  entityType: 'resource',
                  getEntity: (id) => inject(AugmentedResourcesService).getResource(id),
                  getEditorUrl: (id) => inject(CommonEditorUrlsService).resourceEditorUrl(id),
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
  }

  private registerEntities(): void {
    this._entityRegistry.register('resources', 'Resource', {
      icon: 'file-attachment-03',
      component: ResourceSelectionComponent,
    });
  }
}
