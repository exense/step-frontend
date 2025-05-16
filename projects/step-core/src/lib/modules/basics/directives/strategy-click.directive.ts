import { Directive, inject, output } from '@angular/core';
import { CLICK_STRATEGY } from '../injectables/click-strategy.token';
import { ClickStrategyType } from '../types/click-strategy.type';

@Directive({
  selector: '[stepStrategyClick]',
  host: {
    '(click)': 'handleSingleClick($event)',
    '(dblclick)': 'handleDoubleClick($event)',
  },
})
export class StrategyClickDirective {
  private _strategy = inject(CLICK_STRATEGY, { optional: true }) ?? ClickStrategyType.SINGLE_CLICK;

  readonly eventClick = output<MouseEvent>({ alias: 'stepStrategyClick' });

  protected handleSingleClick(event: MouseEvent): void {
    if (this._strategy !== ClickStrategyType.SINGLE_CLICK) {
      this.ignoreEvent(event);
      return;
    }
    this.eventClick.emit(event);
  }

  protected handleDoubleClick(event: MouseEvent): void {
    if (this._strategy !== ClickStrategyType.DOUBLE_CLICK) {
      this.ignoreEvent(event);
      return;
    }
    this.eventClick.emit(event);
  }

  private ignoreEvent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}
