import { Directive, forwardRef, inject, input, untracked } from '@angular/core';
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
  private _tableHighlightItemContainerInjected = inject(TableHighlightItemContainer, { optional: true });

  readonly tableHighlightItemContainerInput = input<TableHighlightItemContainer | unknown | undefined>(undefined, {
    alias: 'stepHighlightTableRow',
  });

  private get tableHighlightItemContainer(): TableHighlightItemContainer | undefined {
    const tableHighlightItemContainerInput = untracked(() =>
      this.tableHighlightItemContainerInput(),
    ) as TableHighlightItemContainer;
    return this._tableHighlightItemContainerInjected ?? tableHighlightItemContainerInput ?? undefined;
  }

  receiveHoveredItem(item: unknown): void {
    this.tableHighlightItemContainer?.setHighlightedItem?.(item);
  }

  receiveHoldItem(item: unknown): void {
    this.tableHighlightItemContainer?.setHighlightedItem?.(item);
  }
}
