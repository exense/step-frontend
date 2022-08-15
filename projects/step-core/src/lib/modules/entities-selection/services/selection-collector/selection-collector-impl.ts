import { SelectionCollector } from './selection-collector';
import { BehaviorSubject, bufferTime, filter, map, Observable } from 'rxjs';
import { AutoDeselectStrategy } from '../../shared/auto-deselect-strategy.enum';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable()
export class SelectionCollectorImpl<KEY, ENTITY> implements SelectionCollector<KEY, ENTITY>, OnDestroy {
  private possibleSelections = new Set<ENTITY>();

  private unregister$ = new BehaviorSubject<ENTITY | undefined>(undefined);

  private _selected$ = new BehaviorSubject<ReadonlyArray<KEY>>([]);

  readonly selected$: Observable<ReadonlyArray<KEY>> = this._selected$.asObservable();

  readonly length$: Observable<number> = this.selected$.pipe(map((selected) => selected.length));

  private selectionKeyProperty!: string;
  private autoDeselectStrategy!: AutoDeselectStrategy;

  setup(selectionKeyProperty: string, autoDeselectStrategy: AutoDeselectStrategy): void {
    this.selectionKeyProperty = selectionKeyProperty;
    this.autoDeselectStrategy = autoDeselectStrategy;
    this.unregister$
      .pipe(
        filter((x) => !!x),
        bufferTime(100),
        map((items) => items.filter((x) => this.isSelected(x!)) as ENTITY[]),
        filter((items) => items.length > 0)
      )
      .subscribe((items) => this.deselect(...items));
  }

  get selected(): ReadonlyArray<KEY> {
    return this._selected$.value;
  }

  get length(): number {
    return this._selected$.value.length;
  }

  get possibleLength(): number {
    return this.possibleSelections.size;
  }

  clear(): void {
    this._selected$.next([]);
  }

  selectPossibleItems(): void {
    this.select(...Array.from(this.possibleSelections));
  }

  registerPossibleSelection(item: ENTITY): void {
    this.possibleSelections.add(item);
  }

  unregisterPossibleSelection(item: ENTITY): void {
    this.possibleSelections.delete(item);
    if (this.autoDeselectStrategy === AutoDeselectStrategy.DESELECT_ON_UNREGISTER) {
      this.unregister$.next(item);
    }
  }

  deselect(...items: ENTITY[]): void {
    const keys = items.map((item) => (item as any)[this.selectionKeyProperty] as KEY);
    this.deselectById(...keys);
  }

  deselectById(...ids: KEY[]): void {
    const filteredKeys = this._selected$.value.filter((key) => !ids.includes(key));
    this._selected$.next(filteredKeys);
  }

  isSelected(item: ENTITY): boolean {
    return this.isSelectedById((item as any)[this.selectionKeyProperty]);
  }

  isSelectedById(id: KEY): boolean {
    return this._selected$.value.includes(id);
  }

  select(...items: ENTITY[]): void {
    const keys = items.map((item) => (item as any)[this.selectionKeyProperty] as KEY);
    this.selectById(...keys);
  }

  selectById(...ids: KEY[]): void {
    // use Set to exclude duplicates
    const allKeys = Array.from(new Set([...ids, ...this._selected$.value]));
    this._selected$.next(allKeys);
  }

  toggleSelection(item: ENTITY): void {
    this.toggleSelectionById((item as any)[this.selectionKeyProperty]);
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
    this.possibleSelections.clear();
    this.unregister$.complete();
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
