import { Provider } from '@angular/core';

export abstract class TableHighlightItemContainer {
  abstract highlightedItem?: unknown;
}

export const tableHighlightItemContainerProvider = (): Provider => ({
  provide: TableHighlightItemContainer,
  useValue: {
    highlightedItem: undefined,
  } as TableHighlightItemContainer,
});
