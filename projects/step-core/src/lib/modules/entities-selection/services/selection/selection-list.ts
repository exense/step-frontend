export abstract class SelectionList<KEY, ENTITY> {
  abstract selectAll(): void;
  abstract selectVisible(): void;
  abstract selectFiltered(): void;
  abstract clearSelection(): void;
  abstract select(item: ENTITY): void;
  abstract deselect(item: ENTITY): void;
  abstract toggleSelection(item: ENTITY): void;
  abstract selectIds(keys: KEY[]): void;
}
