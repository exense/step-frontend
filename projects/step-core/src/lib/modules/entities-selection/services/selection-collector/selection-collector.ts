import { Observable } from 'rxjs';
import { RegistrationStrategy } from '../../shared/registration.strategy';

export abstract class SelectionCollector<KEY, ENTITY> {
  abstract readonly selected$: Observable<ReadonlyArray<KEY>>;
  abstract readonly selected: ReadonlyArray<KEY>;

  abstract readonly length$: Observable<number>;
  abstract readonly length: number;

  abstract readonly possibleLength: number;
  abstract readonly registrationStrategy: RegistrationStrategy;

  abstract isSelected(item: ENTITY): boolean;
  abstract isSelectedById(id: KEY): boolean;
  abstract toggleSelection(item: ENTITY): void;
  abstract toggleSelectionById(id: KEY): void;
  abstract select(...items: ENTITY[]): void;
  abstract selectById(...ids: KEY[]): void;
  abstract deselect(...items: ENTITY[]): void;
  abstract deselectById(...ids: KEY[]): void;
  abstract clear(): void;
  abstract selectPossibleItems(): void;
  abstract registerPossibleSelectionManually(items: ENTITY[]): void;
  abstract registerPossibleSelection(item: ENTITY): void;
  abstract unregisterPossibleSelection(item: ENTITY): void;
  abstract isSelectingPossible(): boolean;

  /**
   * Iterates over selected items, which are exists in collector.
   * Check the predicate and returns the map with entity's id and predicate result.
   * Method's result is approximate, because collector might not contain all information about every selected item
   * **/
  abstract checkCurrentSelectionState(predicate: (item: ENTITY) => boolean): Map<KEY, boolean>;
}
