import { DestroyRef, Directive, inject, input, output } from '@angular/core';
import { ClickGuardService, ClickGuard } from '../injectables/click-guard.service';

@Directive({
  selector: '[stepUndraggedClick]',
  host: {
    '(mousedown)': 'handlePointerDown($event)',
    '(click)': 'handleClick($event)',
    '(dblclick)': 'handleClick($event)',
  },
  standalone: false,
})
export class UndraggedClickDirective {
  private _guardService = inject(ClickGuardService);
  private _destroyRef = inject(DestroyRef);

  readonly dragThreshold = input<number | undefined>(undefined, { alias: 'stepUndraggedClickThreshold' });

  readonly undraggedClick = output<MouseEvent>();

  private guard: ClickGuard = this.createGuard();
  private removeWindowListeners?: () => void;

  private createGuard(): ClickGuard {
    return this._guardService.create({
      dragThreshold: this.dragThreshold() ?? 0,
    });
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
    const move = (event: MouseEvent) => this.guard.pointerMove(event);
    const up = () => {
      this.guard.pointerUp();
      this.removeWindowListeners?.();
      this.removeWindowListeners = undefined;
    };

    window.addEventListener('mousemove', move, true);
    window.addEventListener('mouseup', up, true);
    this.removeWindowListeners = () => {
      window.removeEventListener('mousemove', move, true);
      window.removeEventListener('mouseup', up, true);
    };

    this._destroyRef.onDestroy(() => {
      this.removeWindowListeners?.();
      this.removeWindowListeners = undefined;
    });
  }
}
