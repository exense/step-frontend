import {
  afterNextRender,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';

const OVERFLOW_INDICATOR_CLASS = 'step-overflow-indicator-has-overflow';

@Directive({
  selector: '[stepOverflowIndicator]',
})
export class OverflowIndicatorDirective {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _render = inject(Renderer2);

  readonly trackedContent = input.required({
    alias: 'stepOverflowIndicator',
    transform: (value) => (value ?? '').toString(),
  });

  private beginObserve = signal(false);

  readonly hasOverflow = computed(() => {
    const beginObserve = this.beginObserve();
    const trackedContent = this.trackedContent();
    if (!beginObserve) {
      return false;
    }
    const el = this._elRef.nativeElement;
    return el.scrollWidth > el.clientWidth;
  });

  private effectApplyIndicatorClass = effect(() => {
    const hasOverflow = this.hasOverflow();
    const el = this._elRef.nativeElement;
    if (hasOverflow) {
      this._render.addClass(el, OVERFLOW_INDICATOR_CLASS);
    } else {
      this._render.removeClass(el, OVERFLOW_INDICATOR_CLASS);
    }
  });

  constructor() {
    afterNextRender(() => this.beginObserve.set(true));
  }
}
