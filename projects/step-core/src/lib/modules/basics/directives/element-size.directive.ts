import {
  Directive,
  ElementRef,
  forwardRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ElementSizeService } from '../injectables/element-size.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounce, of, timer } from 'rxjs';

const debounceSignal = (value: WritableSignal<number>): Signal<number> => {
  let hasInitialMeasurement = false;
  return toSignal(
    toObservable(value).pipe(
      debounce((size) => {
        if (!hasInitialMeasurement && size > 0) {
          hasInitialMeasurement = true;
          return of(0);
        }
        return timer(300);
      }),
    ),
    { initialValue: 0 },
  );
};

@Directive({
  selector: '[stepElementSize]',
  providers: [
    {
      provide: ElementSizeService,
      useExisting: forwardRef(() => ElementSizeDirective),
    },
  ],
  exportAs: 'ElementSize',
})
export class ElementSizeDirective implements OnInit, OnDestroy, ElementSizeService {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private resizeObserver?: ResizeObserver;

  private readonly widthInternal = signal(0);
  private readonly heightInternal = signal(0);

  readonly width = debounceSignal(this.widthInternal);
  readonly height = debounceSignal(this.heightInternal);

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
