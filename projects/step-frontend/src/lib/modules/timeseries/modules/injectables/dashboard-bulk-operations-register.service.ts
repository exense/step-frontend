import { inject, Injectable } from '@angular/core';
import { AugmentedDashboardsService, BulkOperationType, EntityBulkOperationsRegistryService } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class DashboardBulkOperationsRegisterService {
  private _entityBulkOperationsRegister = inject(EntityBulkOperationsRegistryService);
  private readonly _dashboardsService = inject(AugmentedDashboardsService);

  register(): void {
    this._entityBulkOperationsRegister
      .register('dashboard', {
        type: BulkOperationType.DELETE,
        permission: 'dashboard-delete',
        operation: (requestBody) => this._dashboardsService.deleteDashboards(requestBody),
      })
      .register('dashboard', {
        type: BulkOperationType.DUPLICATE,
        permission: 'dashboard-write',
        operation: (requestBody) => this._dashboardsService.cloneDashboards(requestBody),
      });
  }
}
