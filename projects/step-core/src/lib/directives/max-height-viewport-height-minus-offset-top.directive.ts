import { AfterViewInit, Directive, ElementRef, inject, OnDestroy, Renderer2 } from '@angular/core';
import { debounceTime, map, startWith, Subject, takeUntil } from 'rxjs';
import { resizeObservable } from '../modules/basics/step-basics.module';

@Directive({
  selector: '[stepMaxHeightViewportHeightMinusOffsetTop]',
})
export class MaxHeightViewportHeightMinusOffsetTopDirective implements AfterViewInit, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _render = inject(Renderer2);

  private terminator$ = new Subject<void>();

  ngAfterViewInit(): void {
    resizeObservable(this._elementRef.nativeElement)
      .pipe(
        debounceTime(300),
        map(([entry]) => entry.contentRect.top),
        startWith(() => this._elementRef.nativeElement.getBoundingClientRect().top),
        takeUntil(this.terminator$)
      )
      .subscribe((top) => {
        this._render.setStyle(this._elementRef.nativeElement, 'max-height', `calc(100vh - ${top}px)`);
      });
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
