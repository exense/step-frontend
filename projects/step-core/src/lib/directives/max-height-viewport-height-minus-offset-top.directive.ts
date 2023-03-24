import { Directive, ElementRef, HostBinding } from '@angular/core';

@Directive({
  selector: '[stepMaxHeightViewportHeightMinusOffsetTop]',
})
export class MaxHeightViewportHeightMinusOffsetTopDirective {
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostBinding('style.max-height')
  get maxHeight(): string {
    return `calc(100vh - ${this.elementRef.nativeElement.getBoundingClientRect().top}px)`;
  }
}
