import { afterNextRender, Directive, effect, ElementRef, inject, input, Renderer2, signal } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[matTooltip]',
  standalone: true,
  exportAs: 'matTooltip',
  host: {
    class: 'mat-mdc-tooltip-trigger',
  },
})
export class StandaloneMatTooltipDirective extends MatTooltip {}

const OVERFLOW_INDICATOR_CLASS = 'step-overflow-tooltip-has-overflow';

@Directive({
  selector: '[stepOverflowTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: StandaloneMatTooltipDirective,
      inputs: ['matTooltipPosition'],
    },
  ],
})
export class OverflowTooltipDirective {
  private _matTooltip = inject(StandaloneMatTooltipDirective, { self: true });
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _render = inject(Renderer2);

  readonly message = input.required({
    alias: 'stepOverflowTooltip',
    transform: (value) => (value ?? '').toString(),
  });

  private beginObserve = signal(false);

  constructor() {
    afterNextRender(() => this.beginObserve.set(true));
    effect(() => {
      const beingObserve = this.beginObserve();
      const message = this.message();
      if (!beingObserve) {
        return;
      }
      const el = this._elRef.nativeElement;
      const isOverflow = el.scrollWidth > el.clientWidth;
      this._matTooltip.message = isOverflow ? message : '';
      if (isOverflow) {
        this._render.addClass(el, OVERFLOW_INDICATOR_CLASS);
      } else {
        this._render.removeClass(el, OVERFLOW_INDICATOR_CLASS);
      }
    });
  }
}
