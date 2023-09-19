import { inject, Injectable } from '@angular/core';
import { AugmentedSchedulerService, BulkOperationType, EntityBulkOperationsRegistryService } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskBulkOperationsRegisterService {
  private _entityBulkOperationsRegister = inject(EntityBulkOperationsRegistryService);
  private _api = inject(AugmentedSchedulerService);

  register(): void {
    this._entityBulkOperationsRegister
      .register('tasks', {
        type: BulkOperationType.DELETE,
        permission: 'task-delete',
        operation: (requestBody) => this._api.deleteExecutionTasks(requestBody),
      })
      .register('tasks', {
        type: BulkOperationType.DUPLICATE,
        permission: 'task-write',
        operation: (requestBody) => this._api.cloneExecutionTasks(requestBody),
      });
  }
}
