import { NgModule } from '@angular/core';
import { StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { CurrentOperationsComponent } from './components/current-operations/current-operations.component';
import { OperationComponent } from './components/operation/operation.component';
import './components/operations-list/operations-list.component';
import { OperationsListComponent } from './components/operations-list/operations-list.component';
import { AltOperationComponent } from './components/alt-operation/alt-operation.component';
import { AltCurrentOperationsComponent } from './components/alt-current-operations/alt-current-operations.component';

@NgModule({
  imports: [StepCoreModule, AltOperationComponent, AltCurrentOperationsComponent],
  declarations: [OperationComponent, CurrentOperationsComponent, OperationsListComponent],
  exports: [
    CurrentOperationsComponent,
    OperationComponent,
    OperationsListComponent,
    AltOperationComponent,
    AltCurrentOperationsComponent,
  ],
})
export class OperationsModule {
  constructor(private _viewRegistryService: ViewRegistryService) {
    this.registerViews();
  }

  private registerViews(): void {
    this._viewRegistryService.registerRoute({
      path: 'operations',
      component: OperationsListComponent,
    });
  }
}

export * from './types/execution-view-services';
export * from './types/specific-operations.enum';
