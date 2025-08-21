import { inject, Injectable } from '@angular/core';
import { AugmentedKeywordsService } from '../../../client/step-client-module';
import { BulkOperationType } from '../../basics/types/bulk-operation-type.enum';
import { EntityBulkOperationsRegistryService } from '../../entities-selection';

@Injectable({
  providedIn: 'root',
})
export class FunctionBulkOperationsRegisterService {
  private _api = inject(AugmentedKeywordsService);
  private _registry = inject(EntityBulkOperationsRegistryService);

  register(): void {
    this._registry
      .register('functions', {
        type: BulkOperationType.DELETE,
        permission: 'kw-delete',
        operation: (requestBody) => this._api.deleteFunctions(requestBody),
      })
      .register('functions', {
        type: BulkOperationType.DUPLICATE,
        permission: 'kw-write',
        operation: (requestBody) => this._api.cloneFunctions(requestBody),
      });
  }
}
