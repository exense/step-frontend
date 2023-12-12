import { Directive, HostListener, inject, Input, OnDestroy } from '@angular/core';
import { TableHighlightItemContainer } from '../services/table-highlight-item-container.provider';

@Directive({
  selector: '[stepRowHighlight]',
})
export class RowHighlightDirective implements OnDestroy {
  private _tableHighlight = inject(TableHighlightItemContainer, { optional: true });
  @Input('stepRowHighlight') itemToHighlight?: unknown;

  ngOnDestroy(): void {
    this.removeHighlight();
  }

  @HostListener('mouseenter')
  private handleMouseEnter(): void {
    this.addHighlight();
  }

  @HostListener('mouseleave')
  private handleMouseLeave(): void {
    this.removeHighlight();
  }

  private addHighlight(): void {
    if (!this._tableHighlight) {
      return;
    }
    this._tableHighlight.highlightedItem = this.itemToHighlight;
  }

  private removeHighlight(): void {
    if (!this._tableHighlight) {
      return;
    }
    this._tableHighlight.highlightedItem = undefined;
  }
}
