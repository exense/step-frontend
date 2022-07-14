import { Observable } from 'rxjs';

export interface SelectionCollector<KEY, ENTITY> {
  readonly selected$: Observable<ReadonlyArray<KEY>>;
  readonly selected: ReadonlyArray<KEY>;

  readonly length$: Observable<number>;
  readonly length: number;

  isSelected(item: ENTITY): boolean;
  toggleSelection(item: ENTITY): void;
  select(...items: ENTITY[]): void;
  deselect(...items: ENTITY[]): void;
  clear(): void;

  destroy(): void;
}
