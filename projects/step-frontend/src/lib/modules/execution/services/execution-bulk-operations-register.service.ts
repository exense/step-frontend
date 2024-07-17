import { inject, Injectable } from '@angular/core';
import { AugmentedExecutionsService, BulkOperationType, EntityBulkOperationsRegistryService } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class ExecutionBulkOperationsRegisterService {
  protected _api = inject(AugmentedExecutionsService);
  private _entityBulkOperationRegister = inject(EntityBulkOperationsRegistryService);

  register(): void {
    this._entityBulkOperationRegister
      .register('executions', {
        type: BulkOperationType.RESTART,
        permission: 'plan-bulk-execute',
        operation: (requestBody) => this._api.restartExecutions(requestBody),
      })
      .register('executions', {
        type: BulkOperationType.STOP,
        permission: 'plan-bulk-execute',
        operation: (requestBody) => this._api.stopExecutions(requestBody),
      });
  }
}
