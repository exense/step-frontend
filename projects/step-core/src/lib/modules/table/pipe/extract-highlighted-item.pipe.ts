import { inject, Pipe, PipeTransform, untracked } from '@angular/core';
import { TableHighlightItemContainer } from '../services/table-highlight-item-container.service';

@Pipe({
  name: 'extractHighlightedItem',
})
export class ExtractHighlightedItemPipe implements PipeTransform {
  private _highlightItemContainer = inject(TableHighlightItemContainer);

  transform(value: unknown): unknown {
    const extractor = untracked(() => this._highlightItemContainer.highlightedItemExtractor());
    return !!extractor ? extractor(value) : value;
  }
}
