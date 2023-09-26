import { NgModule } from '@angular/core';
import { EntityRegistry, StepCoreModule } from '@exense/step-core';
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
  constructor(private _entityRegistry: EntityRegistry) {
    this.registerEntities();
  }

  private registerEntities(): void {
    this._entityRegistry.register('resources', 'Resource', {
      icon: 'file-attachment-03',
      component: ResourceSelectionComponent,
    });
  }
}
