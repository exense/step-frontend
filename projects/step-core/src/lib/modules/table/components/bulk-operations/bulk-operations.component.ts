import {
  Component,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import {
  BulkOperationConfig,
  BulkSelectionType,
  EntityBulkOperationsRegistryService,
  SelectionCollector,
  EntityBulkOperationInfo,
  BulkOperationInvokerService,
} from '../../../entities-selection/entities-selection.module';
import { TableFilter } from '../../services/table-filter';
import { TableReload } from '../../services/table-reload';
import { map, of } from 'rxjs';
import { AsyncOperationCloseStatus } from '../../../async-operations/async-operations.module';
import { BulkOperationType } from '../../../basics/types/bulk-operation-type.enum';

@Component({
  selector: 'step-bulk-operations',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
  standalone: false,
})
export class BulkOperationsComponent<KEY, ENTITY> implements OnChanges {
  private _injector = inject(Injector);
  private _tableFilter = inject(TableFilter, { optional: true });
  private _tableReload = inject(TableReload, { optional: true });
  private _entityBulkOperationsRegistry = inject(EntityBulkOperationsRegistryService);
  private _bulkOperationInvoker = inject(BulkOperationInvokerService);
  readonly _selectionCollector = inject<SelectionCollector<KEY, ENTITY>>(SelectionCollector, { optional: true });

  private allowedOperations: (string | BulkOperationType)[] = [];

  protected entityOperations: EntityBulkOperationInfo[] = [];

  protected trackByOperation: TrackByFunction<EntityBulkOperationInfo> = (_, item) => item.type;

  @Input() selectionType: BulkSelectionType = BulkSelectionType.NONE;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

  @Input() entity?: string;

  readonly isOperationsDisabled$ = (this._selectionCollector?.selected$ || of([])).pipe(
    map((selected) => selected.length === 0),
  );

  invoke(operation: EntityBulkOperationInfo): void {
    if (!this.allowedOperations.includes(operation.type)) {
      return;
    }

    if (this.selectionType === BulkSelectionType.NONE) {
      return;
    }

    const config: BulkOperationConfig<KEY> = {
      selectionType: this.selectionType,
      operationInfo: operation,
      withPreview: true,
    };

    if (this.selectionType === BulkSelectionType.FILTERED) {
      config.filterRequest = this._tableFilter?.getTableFilterRequest() || undefined;
    }

    if (this.selectionType === BulkSelectionType.INDIVIDUAL || this.selectionType === BulkSelectionType.VISIBLE) {
      config.ids = this._selectionCollector?.selected || undefined;
    }

    this._bulkOperationInvoker.invokeOperation(config, this._injector).subscribe((result) => {
      if (result?.closeStatus !== AsyncOperationCloseStatus.SUCCESS) {
        return;
      }
      this._tableReload?.reload();
      if (this._selectionCollector) {
        this._selectionCollector.clear();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cEntity = changes['entity'];

    if (cEntity?.currentValue !== cEntity?.previousValue || cEntity?.firstChange) {
      this.fillOperations(cEntity?.currentValue);
    }
  }

  private fillOperations(entity?: string): void {
    entity = entity ?? this.entity;

    if (entity) {
      this.entityOperations = this._entityBulkOperationsRegistry.getEntityBulkOperations(entity);
      this.allowedOperations = this.entityOperations.map((item) => item.type);
    } else {
      this.entityOperations = [];
      this.allowedOperations = [];
    }
  }
}
