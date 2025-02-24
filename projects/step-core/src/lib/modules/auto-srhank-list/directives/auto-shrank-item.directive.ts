import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { ItemWidthRegisterService } from '../injectables/item-width-register.service';
import { KeyValue } from '@angular/common';

@Directive({
  selector: '[stepAutoShrankItem]',
  standalone: true,
})
export class AutoShrankItemDirective implements AfterViewInit {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _itemWidthRegister = inject(ItemWidthRegisterService);

  /** @Input() **/
  readonly item = input.required<KeyValue<string, string>>({ alias: 'stepAutoShrankItem' });

  ngAfterViewInit(): void {
    const width = this._elRef.nativeElement.clientWidth;
    this._itemWidthRegister.registerWidth(this.item(), width);
  }
}
