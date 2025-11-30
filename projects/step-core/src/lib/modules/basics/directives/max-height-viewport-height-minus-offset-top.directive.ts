import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { debounceTime, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { resizeObservable } from '../types/resize-observable';

@Directive({
  selector: '[stepMaxHeightViewportHeightMinusOffsetTop]',
})
export class MaxHeightViewportHeightMinusOffsetTopDirective implements AfterViewInit {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _render = inject(Renderer2);
  private _destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    resizeObservable(this._elementRef.nativeElement)
      .pipe(
        debounceTime(300),
        map(([entry]) => entry.contentRect.top),
        startWith(() => this._elementRef.nativeElement.getBoundingClientRect().top),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((top) => {
        this._render.setStyle(this._elementRef.nativeElement, 'max-height', `calc(100vh - ${top}px)`);
      });
  }
}
