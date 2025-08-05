import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, OnDestroy, Renderer2 } from '@angular/core';
import { debounceTime, map, startWith, Subject, takeUntil } from 'rxjs';
import { resizeObservable } from '../modules/basics/step-basics.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepMaxHeightViewportHeightMinusOffsetTop]',
  standalone: false,
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
