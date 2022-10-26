import { Directive, HostListener, Optional } from '@angular/core';
import { PlanHandleService } from '../services/plan-handle.service';

@Directive({
  selector: '[stepPlanEditorKeyHandler]',
})
export class PlanEditorKeyHandlerDirective {
  constructor(@Optional() private _planHandle?: PlanHandleService) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      if (this.checkKey(event, 'z')) {
        event.preventDefault();
        this._planHandle?.undo();
        return;
      }

      if (this.checkKey(event, 'y')) {
        event.preventDefault();
        this._planHandle?.redo();
        return;
      }

      if (this.checkKey(event, 'Up', 'ArrowUp')) {
        event.preventDefault();
        this._planHandle?.moveUp();
        return;
      }

      if (this.checkKey(event, 'Down', 'ArrowDown')) {
        event.preventDefault();
        this._planHandle?.moveDown();
        return;
      }

      if (this.checkKey(event, 'c')) {
        event.preventDefault();
        this._planHandle?.copy();
        return;
      }

      if (this.checkKey(event, 'v')) {
        event.preventDefault();
        this._planHandle?.paste();
        return;
      }

      if (this.checkKey(event, 'e')) {
        event.preventDefault();
        this._planHandle?.toggleSkip();
        return;
      }
    }

    if (this.checkKey(event, 'Del', 'Delete')) {
      event.preventDefault();
      this._planHandle?.delete();
      return;
    }

    if (this.checkKey(event, 'F2')) {
      event.preventDefault();
      this._planHandle?.rename();
      return;
    }
  }

  private checkKey(event: KeyboardEvent, ...keys: string[]): boolean {
    return keys.includes(event.key);
  }
}
