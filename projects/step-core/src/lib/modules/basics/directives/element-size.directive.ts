import { AfterViewInit, Directive, ElementRef, forwardRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ElementSizeService } from '../injectables/element-size.service';

@Directive({
  selector: '[stepElementSize]',
  standalone: true,
  providers: [
    {
      provide: ElementSizeService,
      useExisting: forwardRef(() => ElementSizeDirective),
    },
  ],
})
export class ElementSizeDirective implements OnInit, OnDestroy, ElementSizeService {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private resizeObserver?: ResizeObserver;

  private widthInternal = signal(0);
  private heightInternal = signal(0);

  readonly width = this.widthInternal.asReadonly();
  readonly height = this.heightInternal.asReadonly();

  ngOnInit(): void {
    this.updateSizes();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSizes();
    });
    this.resizeObserver.observe(this._elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private updateSizes(): void {
    const element = this._elementRef.nativeElement;
    this.widthInternal.set(element.offsetWidth);
    this.heightInternal.set(element.offsetHeight);
  }
}
