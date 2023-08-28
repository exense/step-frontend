import { inject, Injectable } from '@angular/core';
import { AugmentedParametersService, BulkOperationType, EntityBulkOperationsRegistryService } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class ParametersBulkOperationsRegisterService {
  private _api = inject(AugmentedParametersService);
  private _entityBulkOperationRegister = inject(EntityBulkOperationsRegistryService);

  register(): void {
    this._entityBulkOperationRegister
      .register('parameters', {
        type: BulkOperationType.delete,
        permission: 'param-delete',
        operation: (requestBody) => this._api.deleteParameters(requestBody),
      })
      .register('parameters', {
        type: BulkOperationType.duplicate,
        permission: 'param-write',
        operation: (requestBody) => this._api.cloneParameters(requestBody),
      });
  }
}
