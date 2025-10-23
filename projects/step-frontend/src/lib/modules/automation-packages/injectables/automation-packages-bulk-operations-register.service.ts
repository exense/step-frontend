import { inject, Injectable } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  BulkOperationType,
  EntityBulkOperationsRegistryService,
} from '@exense/step-core';
import { AP_ENTITY_ID, AP_RESOURCE_ENTITY_ID, AP_RESOURCE_FILTER } from '../types/constants';
import { AutomationPackagePermission } from '../types/automation-package-permission.enum';

@Injectable({
  providedIn: 'root',
})
export class AutomationPackagesBulkOperationsRegisterService {
  private _entityBulkOperationsRegister = inject(EntityBulkOperationsRegistryService);
  private _automationPackagesApi = inject(AugmentedAutomationPackagesService);

  register(): void {
    this._entityBulkOperationsRegister.register(AP_ENTITY_ID, {
      type: BulkOperationType.DELETE,
      permission: AutomationPackagePermission.DELETE,
      operation: (requestBody) => this._automationPackagesApi.bulkDelete(requestBody),
    });
    this._entityBulkOperationsRegister.register(AP_RESOURCE_ENTITY_ID, {
      type: BulkOperationType.DELETE,
      permission: 'resource-bulk-delete',
      operation: (requestBody) =>
        this._automationPackagesApi.bulkDeleteAutomationPackageResource(requestBody, AP_RESOURCE_FILTER),
    });
    this._entityBulkOperationsRegister.register(AP_RESOURCE_ENTITY_ID, {
      type: BulkOperationType.REFRESH,
      permission: 'resource-write',
      operation: (requestBody) =>
        this._automationPackagesApi.bulkRefreshAutomationPackageResource(requestBody, AP_RESOURCE_FILTER),
    });
  }
}
