import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[stepElementResize]',
})
export class ElementResizeDirective implements OnInit, OnDestroy {
  @Output('stepElementResize') elementResize = new EventEmitter<void>();

  private resizeObserver?: ResizeObserver;

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.elementResize.emit();
    });

    this.resizeObserver.observe(this._elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
