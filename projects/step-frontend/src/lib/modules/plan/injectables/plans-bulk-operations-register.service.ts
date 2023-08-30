import { inject, Injectable } from '@angular/core';
import { BulkOperationType, EntityBulkOperationsRegistryService, PlansService } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class PlansBulkOperationsRegisterService {
  private _entityBulkOperationsRegister = inject(EntityBulkOperationsRegistryService);
  private _plans = inject(PlansService);

  register(): void {
    this._entityBulkOperationsRegister
      .register('plans', {
        type: BulkOperationType.delete,
        permission: 'plan-delete',
        operation: (requestBody) => this._plans.deletePlans(requestBody),
      })
      .register('plans', {
        type: BulkOperationType.duplicate,
        permission: 'plan-write',
        operation: (requestBody) => this._plans.clonePlans(requestBody),
      });
  }
}
