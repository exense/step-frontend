import { Directive, inject, Input, OnDestroy } from '@angular/core';
import { ItemHoldReceiverService } from '../injectables/item-hold-receiver.service';

@Directive({
  selector: '[stepItemHold]',
  exportAs: 'ItemHold',
  standalone: false,
})
export class ItemHoldDirective implements OnDestroy {
  private _holdReceiver? = inject(ItemHoldReceiverService, { optional: true });

  @Input('stepItemHold') itemHold?: unknown;

  hold(): void {
    this._holdReceiver?.receiveHoldItem(this.itemHold);
  }

  unHold(): void {
    this._holdReceiver?.receiveHoldItem(undefined);
  }

  ngOnDestroy(): void {
    this._holdReceiver?.receiveHoldItem(undefined);
  }
}
