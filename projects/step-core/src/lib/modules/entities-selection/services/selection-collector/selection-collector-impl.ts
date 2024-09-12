import { SelectionCollector } from './selection-collector';
import { BehaviorSubject, bufferTime, filter, map, Observable } from 'rxjs';
import { AutoDeselectStrategy } from '../../shared/auto-deselect-strategy.enum';
import { Injectable, OnDestroy } from '@angular/core';
import { RegistrationStrategy } from '../../shared/registration.strategy';

@Injectable()
export class SelectionCollectorImpl<KEY, ENTITY> implements SelectionCollector<KEY, ENTITY>, OnDestroy {
  private possibleSelections = new Set<ENTITY>();
  private selectedPossible: boolean = false;

  private unregister$ = new BehaviorSubject<ENTITY | undefined>(undefined);

  private _selected$ = new BehaviorSubject<ReadonlyArray<KEY>>([]);
  readonly selected$: Observable<ReadonlyArray<KEY>> = this._selected$.asObservable();

  readonly length$: Observable<number> = this.selected$.pipe(map((selected) => selected.length));

  private selectionKeyProperty!: string;

  private autoDeselectStrategy!: AutoDeselectStrategy;

  private registrationStrategyInternal!: RegistrationStrategy;

  setup(
    selectionKeyProperty: string,
    autoDeselectStrategy: AutoDeselectStrategy,
    registrationStrategy: RegistrationStrategy,
  ): void {
    this.selectionKeyProperty = selectionKeyProperty;
    this.autoDeselectStrategy = autoDeselectStrategy;
    this.registrationStrategyInternal = registrationStrategy;
    this.unregister$
      .pipe(
        filter((x) => !!x),
        bufferTime(100),
        map((items) => items.filter((x) => this.isSelected(x!)) as ENTITY[]),
        filter((items) => items.length > 0),
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

  get registrationStrategy(): RegistrationStrategy {
    return this.registrationStrategyInternal;
  }

  clear(): void {
    this.selectedPossible = false;
    this._selected$.next([]);
  }

  selectPossibleItems(): void {
    this.selectedPossible = true;
    this.select(...Array.from(this.possibleSelections));
  }

  registerPossibleSelectionManually(items: ENTITY[]): void {
    if (this.registrationStrategyInternal !== RegistrationStrategy.MANUAL) {
      throw new Error('This method can be invoked with MANUAL registration strategy only');
    }
    this.possibleSelections = new Set(items);
  }

  registerPossibleSelection(item: ENTITY): void {
    if (this.registrationStrategyInternal !== RegistrationStrategy.AUTO) {
      return;
    }
    this.possibleSelections.add(item);
  }

  unregisterPossibleSelection(item: ENTITY): void {
    if (this.registrationStrategyInternal !== RegistrationStrategy.AUTO) {
      return;
    }
    this.possibleSelections.delete(item);
    if (this.autoDeselectStrategy === AutoDeselectStrategy.DESELECT_ON_UNREGISTER) {
      this.unregister$.next(item);
    }
  }

  deselect(...items: ENTITY[]): void {
    this.selectedPossible = false;
    const keys = items.map((item) => (item as any)[this.selectionKeyProperty] as KEY);
    this.deselectById(...keys);
  }

  deselectById(...ids: KEY[]): void {
    this.selectedPossible = false;
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
    const existed = new Set(this._selected$.value);

    // use Set to exclude duplicates
    const idsToInsert = ids.filter((id) => !existed.has(id));

    this._selected$.next([...this._selected$.value, ...idsToInsert]);
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

  /**
   * Iterates over selected items, which are exists in collector.
   * Check the predicate and returns the map with entity's id and predicate result.
   * Method's result is approximate, because collector might not contain all information about every selected item
   * **/
  checkCurrentSelectionState(predicate: (item: ENTITY) => boolean): Map<KEY, boolean> {
    return Array.from(this.possibleSelections)
      .filter((entity) => this.isSelected(entity))
      .reduce((result, entity) => {
        const key = (entity as any)[this.selectionKeyProperty] as KEY;
        result.set(key, predicate(entity));
        return result;
      }, new Map<KEY, boolean>());
  }

  isSelectingPossible(): boolean {
    return this.selectedPossible;
  }

  ngOnDestroy(): void {
    this._selected$.complete();
    this.possibleSelections.clear();
    this.unregister$.complete();
  }
}
