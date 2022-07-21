import { SelectionCollector } from './selection-collector';
import { BehaviorSubject, map, Observable } from 'rxjs';

export class SelectionCollectorImpl<KEY, ENTITY> implements SelectionCollector<KEY, ENTITY> {
  constructor(private _selectionKeyProperty: string) {}

  private _selected$ = new BehaviorSubject<ReadonlyArray<KEY>>([]);

  readonly selected$: Observable<ReadonlyArray<KEY>> = this._selected$.asObservable();

  readonly length$: Observable<number> = this.selected$.pipe(map((selected) => selected.length));

  get selected(): ReadonlyArray<KEY> {
    return this._selected$.value;
  }

  get length(): number {
    return this._selected$.value.length;
  }

  clear(): void {
    this._selected$.next([]);
  }

  deselect(...items: ENTITY[]): void {
    const keys = items.map((item) => (item as any)[this._selectionKeyProperty] as KEY);
    this.deselectById(...keys);
  }

  deselectById(...ids: KEY[]): void {
    const filteredKeys = this._selected$.value.filter((key) => !ids.includes(key));
    this._selected$.next(filteredKeys);
  }

  isSelected(item: ENTITY): boolean {
    return this.isSelectedById((item as any)[this._selectionKeyProperty]);
  }

  isSelectedById(id: KEY): boolean {
    return this._selected$.value.includes(id);
  }

  select(...items: ENTITY[]): void {
    const keys = items.map((item) => (item as any)[this._selectionKeyProperty] as KEY);
    this.selectById(...keys);
  }

  selectById(...ids: KEY[]): void {
    // use Set to exclude duplicates
    const allKeys = Array.from(new Set([...ids, ...this._selected$.value]));
    this._selected$.next(allKeys);
  }

  toggleSelection(item: ENTITY): void {
    this.toggleSelectionById((item as any)[this._selectionKeyProperty]);
  }

  toggleSelectionById(id: KEY): void {
    if (this.isSelectedById(id)) {
      this.deselectById(id);
    } else {
      this.selectById(id);
    }
  }

  destroy(): void {
    this._selected$.complete();
  }
}
