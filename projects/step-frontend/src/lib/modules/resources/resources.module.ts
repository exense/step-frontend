import { NgModule } from '@angular/core';
import { EntityRegistry, StepCoreModule } from '@exense/step-core';
import { ResourceInputComponent } from './components/resouce-input/resouce-input.component';
import './components/resource-selection/resource-selection.component';
import { ResourceSelectionComponent } from './components/resource-selection/resource-selection.component';

@NgModule({
  imports: [StepCoreModule],
  declarations: [ResourceSelectionComponent, ResourceInputComponent],
  exports: [ResourceSelectionComponent, ResourceInputComponent],
})
export class ResourcesModule {
  constructor(private _entityRegistry: EntityRegistry) {
    this.registerEntities();
  }

  private registerEntities(): void {
    this._entityRegistry.registerEntity(
      'Resource',
      'resources',
      'book',
      'resources',
      'rest/resources/',
      'rest/resources/',
      'st-table',
      '/partials/resources/resourceSelectionTable.html'
    );
  }
}
