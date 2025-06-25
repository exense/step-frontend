import { Directive, ElementRef, forwardRef, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ElementSizeService } from '../injectables/element-size.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

const debounceSignal = (value: WritableSignal<number>, dueTime: number = 300, initialValue: number = 0) =>
  toSignal(toObservable(value).pipe(debounceTime(dueTime)), { initialValue });

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
