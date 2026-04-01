import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[stepCalcElementWidthItem]',
})
export class CalcElementWidthItemDirective {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);

  get width(): number {
    return this._el.nativeElement.getBoundingClientRect().width;
  }
}
