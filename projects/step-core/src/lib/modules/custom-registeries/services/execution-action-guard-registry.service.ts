import { inject, Injectable } from '@angular/core';
import { CustomRegistryService } from './custom-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { ExecutionActionGuard } from '../shared/execution-action-guard.interface';

@Injectable({
  providedIn: 'root',
})
export class ExecutionActionGuardRegistryService {
  private readonly _customRegistry = inject(CustomRegistryService);
  private readonly registryType = CustomRegistryType.EXECUTION_ACTION_GUARD;

  register(guard: ExecutionActionGuard): void {
    this._customRegistry.register(this.registryType, guard.type, guard);
  }

  getGuards(actionType: string): ReadonlyArray<ExecutionActionGuard> {
    return (this._customRegistry.getRegisteredItems(this.registryType) as ExecutionActionGuard[])
      .filter((guard) => guard.actionType === actionType)
      .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
  }

  hasGuards(actionType: string): boolean {
    return this.getGuards(actionType).length > 0;
  }
}
