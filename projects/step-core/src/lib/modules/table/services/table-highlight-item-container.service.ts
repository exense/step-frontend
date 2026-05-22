import { Signal } from '@angular/core';

export type HighlightedItemExtractor<T = any, I = any> = (row?: T) => I | undefined;

export abstract class TableHighlightItemContainer {
  abstract highlightedItemExtractor: Signal<HighlightedItemExtractor<unknown, unknown> | undefined>;
  abstract setHighlightedItem(highlightedItem: unknown): void;
}
