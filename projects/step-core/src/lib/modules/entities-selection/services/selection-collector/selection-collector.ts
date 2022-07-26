import { Observable } from 'rxjs';

export interface SelectionCollector<KEY, ENTITY> {
  readonly selected$: Observable<ReadonlyArray<KEY>>;
  readonly selected: ReadonlyArray<KEY>;

  readonly length$: Observable<number>;
  readonly length: number;

  isSelected(item: ENTITY): boolean;
  isSelectedById(id: KEY): boolean;
  toggleSelection(item: ENTITY): void;
  toggleSelectionById(id: KEY): void;
  select(...items: ENTITY[]): void;
  selectById(...ids: KEY[]): void;
  deselect(...items: ENTITY[]): void;
  deselectById(...ids: KEY[]): void;
  clear(): void;

  destroy(): void;
}
