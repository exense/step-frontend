import { ChangeDetectionStrategy, Component, computed, inject, Injector, input } from '@angular/core';
import {
  BulkOperationConfig,
  BulkOperationInvokerService,
  BulkSelectionType,
  ENTITIES_SELECTION_EXPORTS,
  EntityBulkOperationInfo,
  EntityBulkOperationsRegistryService,
  EntitySelectionState,
  SelectionList,
} from '../../../entities-selection';
import { TableFilter } from '../../services/table-filter';
import { TableReload } from '../../services/table-reload';
import { AsyncOperationCloseStatus } from '../../../async-operations/async-operations.module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AUTH_EXPORTS } from '../../../auth';

@Component({
  selector: 'step-bulk-operations',
  imports: [ENTITIES_SELECTION_EXPORTS, StepBasicsModule, AUTH_EXPORTS],
  templateUrl: './bulk-operations.component.html',
  styleUrl: './bulk-operations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkOperationsComponent<KEY, ENTITY> {
  private _injector = inject(Injector);
  private _tableFilter = inject(TableFilter);
  private _tableReload = inject(TableReload);
  private _entityBulkOperationsRegistry = inject(EntityBulkOperationsRegistryService);
  private _bulkOperationInvoker = inject(BulkOperationInvokerService);
  private _selectionState = inject<EntitySelectionState<KEY, ENTITY>>(EntitySelectionState);
  private _selectionList = inject<SelectionList<KEY, ENTITY>>(SelectionList);

  readonly entity = input<string | undefined>(undefined);

  protected readonly entityOperations = computed(() => {
    const entity = this.entity();
    if (!entity) {
      return [];
    }
    return this._entityBulkOperationsRegistry.getEntityBulkOperations(entity);
  });

  protected readonly isOperationsDisabled = computed(() => {
    const size = this._selectionState.selectedSize();
    return size === 0;
  });

  protected invoke(operationInfo: EntityBulkOperationInfo): void {
    const selectionType = this._selectionState.selectionType();
    if (selectionType === BulkSelectionType.NONE) {
      return;
    }

    const config: BulkOperationConfig<KEY> = {
      selectionType,
      operationInfo,
      withPreview: true,
    };

    if (selectionType === BulkSelectionType.FILTERED) {
      config.filterRequest = this._tableFilter?.getTableFilterRequest() || undefined;
    }

    if (selectionType === BulkSelectionType.INDIVIDUAL || selectionType === BulkSelectionType.VISIBLE) {
      const keys = this._selectionState.selectedKeys();
      config.ids = keys.size > 0 ? Array.from(keys) : undefined;
    }

    this._bulkOperationInvoker.invokeOperation(config, this._injector).subscribe((result) => {
      if (result?.closeStatus !== AsyncOperationCloseStatus.SUCCESS) {
        return;
      }
      this._tableReload.reload();
      this._selectionList.clearSelection();
    });
  }
}
