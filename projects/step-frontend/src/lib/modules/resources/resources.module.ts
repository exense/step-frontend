import { NgModule } from '@angular/core';
import { EntityRegistry, StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { ResourceConfigurationDialogComponent } from './components/resource-configuration-dialog/resource-configuration-dialog.component';
import './components/resource-selection/resource-selection.component';
import { ResourceSelectionComponent } from './components/resource-selection/resource-selection.component';
import { ResourcesListComponent } from './components/resources-list/resources-list.component';

@NgModule({
  imports: [StepCoreModule],
  declarations: [ResourceSelectionComponent, ResourcesListComponent, ResourceConfigurationDialogComponent],
  exports: [ResourceSelectionComponent, ResourcesListComponent, ResourceConfigurationDialogComponent],
})
export class ResourcesModule {
  constructor(private _entityRegistry: EntityRegistry, private _viewRegistry: ViewRegistryService) {
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
    });
  }

  private registerEntities(): void {
    this._entityRegistry.register('resources', 'Resource', {
      icon: 'file-attachment-03',
      component: ResourceSelectionComponent,
    });
  }
}
