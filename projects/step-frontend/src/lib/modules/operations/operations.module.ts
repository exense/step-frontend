import { NgModule } from '@angular/core';
import { StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { CurrentOperationsComponent } from './components/current-operations/current-operations.component';
import { OperationComponent } from './components/operation/operation.component';
import './components/operations-list/operations-list.component';
import { OperationsListComponent } from './components/operations-list/operations-list.component';

@NgModule({
  imports: [StepCoreModule],
  declarations: [OperationComponent, CurrentOperationsComponent, OperationsListComponent],
  exports: [CurrentOperationsComponent, OperationComponent, OperationsListComponent],
})
export class OperationsModule {
  constructor(private _viewRegistryService: ViewRegistryService) {
    this.registerViews();
  }

  private registerViews(): void {
    this._viewRegistryService.registerView('operations', 'partials/operations/operationsList.html');
  }
}

export * from './shared/execution-view-services';
