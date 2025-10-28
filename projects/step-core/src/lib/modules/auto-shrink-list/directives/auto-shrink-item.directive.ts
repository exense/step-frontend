import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { ItemWidthRegisterService } from '../injectables/item-width-register.service';

@Directive({
  selector: '[stepAutoShrinkItem]',
})
export class AutoShrinkItemDirective<T> implements AfterViewInit {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _itemWidthRegister = inject<ItemWidthRegisterService<T>>(ItemWidthRegisterService);

  readonly item = input.required<T>({ alias: 'stepAutoShrinkItem' });

  ngAfterViewInit(): void {
    const width = this._elRef.nativeElement.clientWidth;
    this._itemWidthRegister.registerWidth(this.item(), width);
  }
}
