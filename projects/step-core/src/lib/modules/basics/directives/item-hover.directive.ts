import { Directive, EventEmitter, HostListener, inject, Input, OnDestroy, Output } from '@angular/core';
import { ItemHoverReceiverService } from '../injectables/item-hover-receiver.service';

@Directive({
  selector: '[stepItemHover]',
  standalone: false,
})
export class ItemHoverDirective implements OnDestroy {
  private _hoverReceiver? = inject(ItemHoverReceiverService, { optional: true });

  @Input('stepItemHover') itemHover?: unknown;
  @Output() hover = new EventEmitter<unknown | undefined>();

  ngOnDestroy() {
    this.handleHover(undefined);
  }

  @HostListener('mouseenter')
  private handleMouseEnter(): void {
    this.handleHover(this.itemHover);
  }

  @HostListener('mouseleave')
  private handleMouseLeave(): void {
    this.handleHover(undefined);
  }

  private handleHover(item: unknown | undefined) {
    this.hover.emit(item);
    this._hoverReceiver?.receiveHoveredItem(item);
  }
}
