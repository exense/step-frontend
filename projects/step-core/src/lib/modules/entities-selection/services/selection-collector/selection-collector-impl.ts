import { SelectionCollector } from './selection-collector';
import { BehaviorSubject, Subject, bufferTime, filter, map, Observable, distinctUntilChanged } from 'rxjs';
import { AutoDeselectStrategy } from '../../shared/auto-deselect-strategy.enum';
import { Injectable, OnDestroy } from '@angular/core';
import { RegistrationStrategy } from '../../shared/registration.strategy';

@Injectable()
export class SelectionCollectorImpl<KEY, ENTITY> implements SelectionCollector<KEY, ENTITY>, OnDestroy {
  private possibleSelections = new Map<ENTITY, number>();
  private selectedPossible: boolean = false;

  private registerPossible$ = new Subject<ENTITY>();
  private unregisterPossible$ = new Subject<ENTITY>();

  private unregister$ = new BehaviorSubject<ENTITY | undefined>(undefined);

  private selectedInternal$ = new BehaviorSubject<ReadonlyArray<KEY>>([]);
  readonly selected$: Observable<ReadonlyArray<KEY>> = this.selectedInternal$.asObservable();

  readonly length$: Observable<number> = this.selected$.pipe(map((selected) => selected.length));

  private selectionKeyProperty!: string;

  private autoDeselectStrategy!: AutoDeselectStrategy;

  private registrationStrategyInternal!: RegistrationStrategy;

  private registerPossibleSubscription = this.registerPossible$.pipe(distinctUntilChanged()).subscribe((item) => {
    const count = (this.possibleSelections.get(item) ?? 0) + 1;
    this.possibleSelections.set(item, count);
  });

  private unregisterPossibleSubscription = this.unregisterPossible$.pipe(distinctUntilChanged()).subscribe((item) => {
    const count = (this.possibleSelections.get(item) ?? 0) - 1;
    if (count <= 0) {
      this.possibleSelections.delete(item);
    } else {
      this.possibleSelections.set(item, count);
    }
  });

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
    return this.selectedInternal$.value;
  }

  get length(): number {
    return this.selectedInternal$.value.length;
  }

  get possibleLength(): number {
    return this.possibleSelections.size;
  }

  get registrationStrategy(): RegistrationStrategy {
    return this.registrationStrategyInternal;
  }

  clear(): void {
    this.selectedPossible = false;
    this.selectedInternal$.next([]);
  }

  selectPossibleItems(): void {
    this.selectedPossible = true;
    this.select(...Array.from(this.possibleSelections.keys()));
  }

  registerPossibleSelectionManually(items: ENTITY[]): void {
    if (this.registrationStrategyInternal !== RegistrationStrategy.MANUAL) {
      throw new Error('This method can be invoked with MANUAL registration strategy only');
    }
    this.possibleSelections.clear();
    items.forEach((item) => this.possibleSelections.set(item, 1));
  }

  registerPossibleSelection(item: ENTITY): void {
    if (this.registrationStrategyInternal !== RegistrationStrategy.AUTO) {
      return;
    }
    this.registerPossible$.next(item);
  }

  unregisterPossibleSelection(item: ENTITY): void {
    if (this.registrationStrategyInternal !== RegistrationStrategy.AUTO) {
      return;
    }
    this.unregisterPossible$.next(item);
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
    const filteredKeys = this.selectedInternal$.value.filter((key) => !ids.includes(key));
    this.selectedInternal$.next(filteredKeys);
  }

  isSelected(item: ENTITY): boolean {
    return this.isSelectedById((item as any)[this.selectionKeyProperty]);
  }

  isSelectedById(id: KEY): boolean {
    return this.selectedInternal$.value.includes(id);
  }

  select(...items: ENTITY[]): void {
    const keys = items.map((item) => (item as any)[this.selectionKeyProperty] as KEY);
    this.selectById(...keys);
  }

  selectById(...ids: KEY[]): void {
    const existed = new Set(this.selectedInternal$.value);

    // use Set to exclude duplicates
    const idsToInsert = ids.filter((id) => !existed.has(id));

    this.selectedInternal$.next([...this.selectedInternal$.value, ...idsToInsert]);
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
    return Array.from(this.possibleSelections.keys())
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
    this.registerPossible$.complete();
    this.unregisterPossible$.complete();
    this.selectedInternal$.complete();
    this.possibleSelections.clear();
    this.unregister$.complete();
  }
}
