import {
  EntitySelectionStateUpdatable,
  UpdateSelectionMode,
  UpdateSelectionParamsEntities,
  UpdateSelectionParamsKeys,
} from './entity-selection-state';
import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';

@Injectable()
export class EntitySelectionStateImpl<KEY, ENTITY> implements EntitySelectionStateUpdatable<KEY, ENTITY>, OnDestroy {
  private selectionKeyProperty!: string;

  private selectedKeysInternal = signal<KEY[]>([]);
  private selectionTypeInternal = signal<BulkSelectionType>(BulkSelectionType.NONE);

  readonly selectedKeys = computed(() => {
    const keys = this.selectedKeysInternal();
    return new Set(keys) as ReadonlySet<KEY>;
  });

  readonly selectedSize = computed(() => this.selectedKeys().size);

  readonly selectionType = this.selectionTypeInternal.asReadonly();

  setup(selectionKeyProperty: string): void {
    this.selectionKeyProperty = selectionKeyProperty;
  }

  ngOnDestroy(): void {
    this.clearSelection();
  }

  clearSelection(): void {
    this.selectedKeysInternal.set([]);
    this.selectionTypeInternal.set(BulkSelectionType.NONE);
  }

  isSelected(item: ENTITY): boolean {
    const key = this.getSelectionKey(item);
    return this.isSelectedByKey(key);
  }

  isSelectedByKey(key: KEY): boolean {
    return this.selectedKeys().has(key);
  }

  updateSelection(params: UpdateSelectionParamsKeys<KEY>): void;
  updateSelection(params: UpdateSelectionParamsEntities<ENTITY>): void;
  updateSelection(params: UpdateSelectionParamsKeys<KEY> | UpdateSelectionParamsEntities<ENTITY>): void {
    if (
      !!(params as UpdateSelectionParamsEntities<ENTITY>).entities &&
      !(params as UpdateSelectionParamsKeys<KEY>).keys
    ) {
      const entityParams = params as UpdateSelectionParamsEntities<ENTITY>;
      const { entities, selectionType, mode } = entityParams;
      const keys = entities!.map((entity) => this.getSelectionKey(entity));
      this.updateSelection({ keys, selectionType, mode });
      return;
    }

    const { keys, selectionType } = params as UpdateSelectionParamsKeys<KEY>;
    const mode = params.mode ?? UpdateSelectionMode.RESET;
    if (!!keys) {
      switch (mode) {
        case UpdateSelectionMode.UPDATE:
          this.selectedKeysInternal.update((value) => [...value, ...keys]);
          break;
        case UpdateSelectionMode.RESET:
          this.selectedKeysInternal.set(keys);
          break;
        case UpdateSelectionMode.REMOVE:
          const keysToRemove = new Set(keys);
          this.selectedKeysInternal.update((value) => value.filter((key) => !keysToRemove.has(key)));
          break;
      }
    }

    if (!!selectionType) {
      this.selectionTypeInternal.set(selectionType);
    }
  }

  getSelectionKey(entity: ENTITY): KEY {
    return (entity as any)[this.selectionKeyProperty] as KEY;
  }
}
