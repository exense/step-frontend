import { inject, Injectable, NgZone, signal, Signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface IndicatorState {
  show(): void;
  hide(): void;
  readonly isVisible: Signal<boolean>;
}

class IndicatorStateImpl implements IndicatorState {
  constructor(
    private minDisplayTime: number,
    private doc: Document,
    private zone: NgZone,
  ) {}

  private timerId?: number;
  private hideRequested = false;
  private isVisibleInternal = signal(false);
  readonly isVisible = this.isVisibleInternal.asReadonly();

  show(): void {
    if (this.timerId !== undefined) {
      this.doc.defaultView!.clearTimeout(this.timerId);
      this.timerId = undefined;
    }
    this.hideRequested = false;
    this.isVisibleInternal.set(true);
    this.zone.runOutsideAngular(() => {
      this.timerId = this.doc.defaultView!.setTimeout(() => {
        if (this.hideRequested) {
          this.isVisibleInternal.set(false);
        }
        this.timerId = undefined;
      }, this.minDisplayTime);
    });
  }

  hide(): void {
    if (this.timerId !== undefined) {
      this.hideRequested = true;
      return;
    }
    this.isVisibleInternal.set(false);
  }
}

@Injectable({
  providedIn: 'root',
})
export class IndicatorStateFactoryService {
  private _doc = inject(DOCUMENT);
  private _zone = inject(NgZone);

  createIndicatorState(minDisplayTime: number = 800): IndicatorState {
    return new IndicatorStateImpl(minDisplayTime, this._doc, this._zone);
  }
}
