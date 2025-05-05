import { inject, Injectable } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  BulkOperationType,
  EntityBulkOperationsRegistryService,
} from '@exense/step-core';
import { ENTITY_ID } from '../types/constants';
import { AutomationPackagePermission } from '../types/automation-package-permission.enum';

@Injectable({
  providedIn: 'root',
})
export class AutomationPackagesBulkOperationsRegisterService {
  private _entityBulkOperationsRegister = inject(EntityBulkOperationsRegistryService);
  private _automationPackagesApi = inject(AugmentedAutomationPackagesService);

  register(): void {
    this._entityBulkOperationsRegister.register(ENTITY_ID, {
      type: BulkOperationType.DELETE,
      permission: AutomationPackagePermission.DELETE,
      operation: (requestBody) => this._automationPackagesApi.bulkDelete(requestBody),
    });
  }
}
