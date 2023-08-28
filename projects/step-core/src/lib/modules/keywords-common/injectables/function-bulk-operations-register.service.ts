import { inject, Injectable } from '@angular/core';
import { AugmentedKeywordsService } from '../../../client/step-client-module';
import { EntityBulkOperationsRegistryService } from '../../custom-registeries/custom-registries.module';
import { BulkOperationType } from '../../basics/shared/bulk-operation-type.enum';

@Injectable({
  providedIn: 'root',
})
export class FunctionBulkOperationsRegisterService {
  private _api = inject(AugmentedKeywordsService);
  private _registry = inject(EntityBulkOperationsRegistryService);

  register(): void {
    this._registry
      .register('functions', {
        type: BulkOperationType.duplicate,
        permission: 'kw-delete',
        operation: (requestBody) => this._api.deleteFunctions(requestBody),
      })
      .register('functions', {
        type: BulkOperationType.duplicate,
        permission: 'kw-write',
        operation: (requestBody) => this._api.cloneFunctions(requestBody),
      });
  }
}
