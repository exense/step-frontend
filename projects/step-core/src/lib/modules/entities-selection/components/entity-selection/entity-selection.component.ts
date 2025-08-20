import { Component, computed, inject, Input, OnChanges, OnDestroy, signal, SimpleChanges } from '@angular/core';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { map, Subject, takeUntil } from 'rxjs';
import { EntitySelectionState } from '../../services/selection/entity-selection-state';
import { SelectionList } from '../../services/selection/selection-list';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';

@Component({
  selector: 'step-entity-selection',
  templateUrl: './entity-selection.component.html',
  styleUrls: ['./entity-selection.component.scss'],
  standalone: false,
})
export class EntitySelectionComponent<KEY, ENTITY> implements OnChanges, OnDestroy {
  private _selectionState = inject<EntitySelectionState<KEY, ENTITY>>(EntitySelectionState, { optional: true });
  private _selectionList = inject<SelectionList<KEY, ENTITY>>(SelectionList, { optional: true });

  private collectorTerminator$?: Subject<void>;

  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() entity?: ENTITY;

  private entitySignal = signal<ENTITY | undefined>(undefined);
  private isSelectedFromCollector = signal(false);
  private isSelectedFromState = computed(() => {
    const keys = this._selectionState?.selectedKeys?.();
    const entity = this.entitySignal();
    return !entity ? undefined : this._selectionState?.isSelected?.(entity);
  });

  readonly isSelected = computed(() => {
    const isSelectedFromCollector = this.isSelectedFromCollector();
    const isSelectedFromState = this.isSelectedFromState();
    return isSelectedFromCollector || isSelectedFromState;
  });

  toggle(): void {
    if (!this.entity) {
      return;
    }
    if (this.selectionCollector) {
      this.selectionCollector.toggleSelection(this.entity);
      return;
    }
    this._selectionList?.toggleSelection?.(this.entity);
  }

  ngOnDestroy(): void {
    if (this.entity && this.selectionCollector) {
      this.selectionCollector.unregisterPossibleSelection(this.entity);
    }
    this.terminateCollector();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let entity: ENTITY | undefined = undefined;
    let selectionCollector: SelectionCollector<KEY, ENTITY> | undefined = undefined;

    const cEntity = changes['entity'];
    if (cEntity?.previousValue !== cEntity?.currentValue) {
      entity = cEntity?.currentValue;
      this.onEntityChange(cEntity?.currentValue, cEntity?.previousValue);
    }

    const cSelectionCollector = changes['selectionCollector'];
    if (cSelectionCollector?.previousValue !== cSelectionCollector?.currentValue) {
      selectionCollector = cSelectionCollector?.currentValue;
      this.onSelectionCollectorChange(cSelectionCollector?.currentValue, cSelectionCollector?.previousValue);
    }

    this.setupStreams(entity, selectionCollector);
  }

  private terminateCollector(): void {
    this.collectorTerminator$?.next?.();
    this.collectorTerminator$?.complete?.();
    this.collectorTerminator$ = undefined;
  }

  private onEntityChange(currentValue?: ENTITY, previousValue?: ENTITY): void {
    this.entitySignal.set(currentValue);
    if (!this.selectionCollector) {
      return;
    }
    if (previousValue) {
      this.selectionCollector.unregisterPossibleSelection(previousValue);
    }
    if (currentValue) {
      this.selectionCollector.registerPossibleSelection(currentValue);
    }
  }

  private onSelectionCollectorChange(
    currentValue?: SelectionCollector<KEY, ENTITY>,
    previousValue?: SelectionCollector<KEY, ENTITY>,
  ): void {
    if (!this.entity) {
      return;
    }
    if (previousValue) {
      previousValue.unregisterPossibleSelection(this.entity);
    }
    if (currentValue) {
      currentValue.registerPossibleSelection(this.entity);
    }
  }

  private setupStreams(entity?: ENTITY, selectionCollector?: SelectionCollector<KEY, ENTITY>): void {
    entity = entity || this.entity;
    selectionCollector = selectionCollector || this.selectionCollector;

    if (!entity || !selectionCollector) {
      return;
    }

    this.terminateCollector();
    this.collectorTerminator$ = new Subject();
    selectionCollector!.selected$
      .pipe(
        map(() => selectionCollector!.isSelected(entity!)),
        takeUntil(this.collectorTerminator$),
      )
      .subscribe((isSelected) => this.isSelectedFromCollector.set(isSelected));
  }
}
