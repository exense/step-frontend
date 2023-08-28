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
        type: BulkOperationType.delete,
        permission: 'execution-delete',
        operation: (requestBody) => this._api.deleteExecutions(requestBody),
      })
      .register('executions', {
        type: BulkOperationType.restart,
        permission: 'plan-execute',
        operation: (requestBody) => this._api.restartExecutions(requestBody),
      })
      .register('executions', {
        type: BulkOperationType.stop,
        permission: 'plan-execute',
        operation: (requestBody) => this._api.stopExecutions(requestBody),
      });
  }
}
