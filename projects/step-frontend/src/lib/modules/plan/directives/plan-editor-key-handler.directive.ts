import { Directive, HostListener, Inject, Optional } from '@angular/core';
import { PlanHandleService } from '../services/plan-handle.service';
import { AuthService } from '@exense/step-core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[stepPlanEditorKeyHandler]',
})
export class PlanEditorKeyHandlerDirective {
  constructor(
    private _authService: AuthService,
    @Inject(DOCUMENT) private _document: Document,
    @Optional() private _planHandle?: PlanHandleService
  ) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      if (this.checkKey(event, false, 'z', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.undo();
        return;
      }

      if (this.checkKey(event, false, 'y', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.redo();
        return;
      }

      if (this.checkKey(event, true, ['Up', 'ArrowUp'], 'plan-write')) {
        event.preventDefault();
        this._planHandle?.moveUp();
        return;
      }

      if (this.checkKey(event, true, ['Down', 'ArrowDown'], 'plan-write')) {
        event.preventDefault();
        this._planHandle?.moveDown();
        return;
      }

      if (this.checkKey(event, true, 'c', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.copy();
        return;
      }

      if (this.checkKey(event, true, 'v', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.paste();
        return;
      }

      if (this.checkKey(event, true, 'e', 'plan-write')) {
        event.preventDefault();
        this._planHandle?.toggleSkip();
        return;
      }

      if (this.checkKey(event, true, 'Enter', 'plan-interactive')) {
        event.preventDefault();
        this._planHandle?.execute();
        return;
      }
    }

    if (this.checkKey(event, true, ['Del', 'Delete'], 'plan-delete')) {
      event.preventDefault();
      this._planHandle?.delete();
      return;
    }

    if (this.checkKey(event, true, 'F2', 'plan-write')) {
      event.preventDefault();
      this._planHandle?.rename();
      return;
    }
  }

  private checkKey(
    event: KeyboardEvent,
    isEmitByTreeOnly: boolean,
    keys: string | string[],
    rights?: string | string[]
  ): boolean {
    // Check event target to prevent false invocation
    // When tree will be in focus, event will be captured from document's body
    if (isEmitByTreeOnly && event.target !== this._document.body) {
      return false;
    }

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
