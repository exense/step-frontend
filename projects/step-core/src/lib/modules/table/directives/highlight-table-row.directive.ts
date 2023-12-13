import { Directive, forwardRef, Input } from '@angular/core';
import { ItemHoverReceiverService } from '../../basics/step-basics.module';
import { TableHighlightItemContainer } from '../shared/table-highlight-item-container';

@Directive({
  selector: '[stepHighlightTableRow]',
  providers: [
    {
      provide: ItemHoverReceiverService,
      useExisting: forwardRef(() => HighlightTableRowDirective),
    },
  ],
})
export class HighlightTableRowDirective implements ItemHoverReceiverService {
  @Input('stepHighlightTableRow')
  tableHighlightItemContainer?: TableHighlightItemContainer;

  receiveHoveredItem(item: unknown): void {
    if (this.tableHighlightItemContainer) {
      this.tableHighlightItemContainer.highlightedItem = item;
    }
  }
}
