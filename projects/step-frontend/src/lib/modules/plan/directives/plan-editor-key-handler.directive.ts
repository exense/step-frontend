import { Directive, HostListener, Optional } from '@angular/core';
import { PlanHandleService } from '../services/plan-handle.service';
import { AuthService } from '@exense/step-core';

@Directive({
  selector: '[stepPlanEditorKeyHandler]',
})
export class PlanEditorKeyHandlerDirective {
  constructor(private _authService: AuthService, @Optional() private _planHandle?: PlanHandleService) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      if (this.checkKey(event, 'z', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.undo();
        return;
      }

      if (this.checkKey(event, 'y', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.redo();
        return;
      }

      if (this.checkKey(event, ['Up', 'ArrowUp'], 'plan-write')) {
        event.preventDefault();
        this._planHandle?.moveUp();
        return;
      }

      if (this.checkKey(event, ['Down', 'ArrowDown'], 'plan-write')) {
        event.preventDefault();
        this._planHandle?.moveDown();
        return;
      }

      if (this.checkKey(event, 'c', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.copy();
        return;
      }

      if (this.checkKey(event, 'v', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.paste();
        return;
      }

      if (this.checkKey(event, 'e', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.toggleSkip();
        return;
      }

      if (this.checkKey(event, 'Enter', 'plan-interactive')) {
        event.preventDefault();
        this._planHandle?.execute();
        return;
      }
    }

    if (this.checkKey(event, ['Del', 'Delete'], 'plan-delete')) {
      event.preventDefault();
      this._planHandle?.delete();
      return;
    }

    if (this.checkKey(event, 'F2', 'plan-write')) {
      event.preventDefault();
      this._planHandle?.rename();
      return;
    }
  }

  private checkKey(event: KeyboardEvent, keys: string | string[], rights?: string | string[]): boolean {
    if (!!rights) {
      const rightsArray = typeof rights === 'string' ? [rights] : rights;
      const rightsConfirmed = rightsArray.every((right) => this._authService.hasRight(right));
      if (!rightsConfirmed) {
        return false;
      }
    }

    const keysArray = typeof keys === 'string' ? [keys] : keys;
    return keysArray.includes(event.key);
  }
}
