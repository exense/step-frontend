import { Directive, forwardRef, inject, Input } from '@angular/core';
import { ItemHoldReceiverService, ItemHoverReceiverService } from '../../basics/step-basics.module';
import { TableHighlightItemContainer } from '../services/table-highlight-item-container.service';

@Directive({
  selector: '[stepHighlightTableRow]',
  providers: [
    {
      provide: ItemHoverReceiverService,
      useExisting: forwardRef(() => HighlightTableRowDirective),
    },
    {
      provide: ItemHoldReceiverService,
      useExisting: forwardRef(() => HighlightTableRowDirective),
    },
  ],
  standalone: false,
})
export class HighlightTableRowDirective implements ItemHoverReceiverService, ItemHoldReceiverService {
  private _tableHighlightItemContainerInjected? = inject(TableHighlightItemContainer, { optional: true });

  @Input('stepHighlightTableRow')
  tableHighlightItemContainerInput?: TableHighlightItemContainer | unknown;

  private get tableHighlightItemContainer(): TableHighlightItemContainer | undefined {
    return this._tableHighlightItemContainerInjected ?? this.tableHighlightItemContainerInput ?? undefined;
  }

  receiveHoveredItem(item: unknown): void {
    if (this.tableHighlightItemContainer) {
      this.tableHighlightItemContainer.highlightedItem = item;
    }
  }

  receiveHoldItem(item: unknown): void {
    if (this.tableHighlightItemContainer) {
      this.tableHighlightItemContainer.highlightedItem = item;
    }
  }
}
