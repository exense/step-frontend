import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ElementRefMapDirective } from './element-ref-map.directive';

@Directive({
  selector: '[widthExpanders]',
  standalone: false,
})
export class WidthExpandersDirective implements OnInit, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() key?: string;

  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      const elements = Array.from(ElementRefMapDirective.instancesByKey.entries())
        .filter(([key]) => key === this.key)
        .flatMap(([key, instances]) => [...instances.map((instance) => instance._elementRef.nativeElement)]);

      elements.forEach((element) => {
        element.style.setProperty('width', '');
      });

      const maxWidth = Math.max(...elements.map((element) => element.getBoundingClientRect().width));

      elements.forEach((element) => {
        element.style.setProperty('width', `${maxWidth}px`);
      });
    });

    this.resizeObserver.observe(this._elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
