import { DestroyRef, Directive, inject, input, output, untracked } from '@angular/core';
import { ClickGuardService, ClickGuard } from '../injectables/click-guard.service';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[stepUndraggedClick]',
  host: {
    '(mousedown)': 'handlePointerDown($event)',
    '(click)': 'handleClick($event)',
    '(dblclick)': 'handleClick($event)',
  },
  standalone: true,
})
export class UndraggedClickDirective {
  private _guardService = inject(ClickGuardService);
  private _doc = inject(DOCUMENT);
  private _destroyRef = inject(DestroyRef);

  private static readonly DEFAULT_DRAG_THRESHOLD = 8;

  readonly dragThreshold = input<number | undefined>(undefined, { alias: 'stepUndraggedClickThreshold' });

  readonly undraggedClick = output<MouseEvent>();

  private guard: ClickGuard = this.createGuard();
  private removeWindowListeners?: () => void;

  private createGuard(): ClickGuard {
    const dragThreshold = untracked(() => this.dragThreshold()) ?? UndraggedClickDirective.DEFAULT_DRAG_THRESHOLD;
    return this._guardService.create({ dragThreshold });
  }

  protected handlePointerDown(event: MouseEvent): void {
    this.guard = this.createGuard();
    this.guard.pointerDown(event);
    this.bindWindowListeners();
  }

  protected handleClick(event: MouseEvent): void {
    if (this.guard.shouldHandleClick(event)) {
      this.undraggedClick.emit(event);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  private bindWindowListeners(): void {
    this.removeWindowListeners?.();
    const move = (event: MouseEvent): void => this.guard.pointerMove(event);
    const up = (): void => {
      this.guard.pointerUp();
      this.removeWindowListeners?.();
      this.removeWindowListeners = undefined;
    };

    this._doc.defaultView?.addEventListener?.('mousemove', move, true);
    this._doc.defaultView?.addEventListener?.('mouseup', up, true);
    this.removeWindowListeners = () => {
      this._doc.defaultView?.removeEventListener?.('mousemove', move, true);
      this._doc.defaultView?.removeEventListener?.('mouseup', up, true);
    };

    this._destroyRef.onDestroy(() => {
      this.removeWindowListeners?.();
      this.removeWindowListeners = undefined;
    });
  }
}
