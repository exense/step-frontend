import { NgModule } from '@angular/core';
import { EntityRegistry, StepCoreModule } from '@exense/step-core';
import { ResourceInputComponent } from './components/resouce-input/resouce-input.component';
import './components/resource-selection/resource-selection.component';
import { ResourceSelectionComponent } from './components/resource-selection/resource-selection.component';
import { ResourcesListComponent } from './components/resources-list/resources-list.component';
import { SearchResourceDialogComponent } from './components/search-resource-dialog/search-resource-dialog.component';

@NgModule({
  imports: [StepCoreModule],
  declarations: [
    ResourceSelectionComponent,
    ResourceInputComponent,
    ResourcesListComponent,
    SearchResourceDialogComponent,
  ],
  exports: [ResourceSelectionComponent, ResourceInputComponent, ResourcesListComponent, SearchResourceDialogComponent],
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
