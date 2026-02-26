import { Directive, inject, output } from '@angular/core';
import { CLICK_STRATEGY } from '../injectables/click-strategy.token';
import { ClickStrategyType } from '../types/click-strategy.type';
import { ClickGuardService } from '../injectables/click-guard.service';

@Directive({
  selector: '[stepStrategyClick]',
  host: {
    '(click)': 'handleSingleClick($event)',
    '(dblclick)': 'handleDoubleClick($event)',
    '(mousedown)': 'handlePointerDown($event)',
    '(mousemove)': 'handlePointerMove($event)',
    '(mouseup)': 'handlePointerUp()',
    '(mouseleave)': 'handlePointerUp()',
  },
  standalone: false,
})
export class StrategyClickDirective {
  private _strategy = inject(CLICK_STRATEGY, { optional: true }) ?? ClickStrategyType.SINGLE_CLICK;
  private _clickGuard = inject(ClickGuardService).create({ dragThreshold: 0 });

  readonly eventClick = output<MouseEvent>({ alias: 'stepStrategyClick' });

  protected handleSingleClick(event: MouseEvent): void {
    if (!this._clickGuard.shouldHandleClick(event)) {
      this.ignoreEvent(event);
      return;
    }
    if (this._strategy !== ClickStrategyType.SINGLE_CLICK) {
      this.ignoreEvent(event);
      return;
    }
    this.eventClick.emit(event);
  }

  protected handleDoubleClick(event: MouseEvent): void {
    if (!this._clickGuard.shouldHandleClick(event)) {
      this.ignoreEvent(event);
      return;
    }
    if (this._strategy !== ClickStrategyType.DOUBLE_CLICK) {
      this.ignoreEvent(event);
      return;
    }
    this.eventClick.emit(event);
  }

  protected handlePointerDown(event: MouseEvent): void {
    this._clickGuard.pointerDown(event);
  }

  protected handlePointerMove(event: MouseEvent): void {
    this._clickGuard.pointerMove(event);
  }

  protected handlePointerUp(): void {
    this._clickGuard.pointerUp();
  }

  private ignoreEvent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}
