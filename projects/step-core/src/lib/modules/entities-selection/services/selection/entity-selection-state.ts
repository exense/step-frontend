import { Signal } from '@angular/core';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';
import { EntitySelectionStateImpl } from './entity-selection-state-impl';

export enum UpdateSelectionMode {
  UPDATE,
  RESET,
  REMOVE,
}

type UpdateSelectionParamsCommon = { selectionType?: BulkSelectionType; mode?: UpdateSelectionMode };
export type UpdateSelectionParamsKeys<KEY> = { keys?: KEY[] } & UpdateSelectionParamsCommon;
export type UpdateSelectionParamsEntities<ENTITY> = { entities?: ENTITY[] } & UpdateSelectionParamsCommon;

export abstract class EntitySelectionState<KEY, ENTITY> {
  abstract readonly selectedKeys: Signal<ReadonlySet<KEY>>;
  abstract readonly selectedSize: Signal<number>;
  abstract readonly selectionType: Signal<BulkSelectionType>;

  abstract isSelected(item: ENTITY): boolean;
  abstract isSelectedByKey(key: KEY): boolean;
}

export abstract class EntitySelectionStateUpdatable<KEY, ENTITY> extends EntitySelectionState<KEY, ENTITY> {
  abstract updateSelection(params: UpdateSelectionParamsKeys<KEY>): void;
  abstract updateSelection(params: UpdateSelectionParamsEntities<ENTITY>): void;
}
