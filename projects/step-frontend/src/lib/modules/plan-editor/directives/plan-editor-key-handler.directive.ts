import { Directive, HostListener, Inject, Optional } from '@angular/core';
import {
  AuthService,
  PlanArtefactResolverService,
  PlanEditorService,
  PlanInteractiveSessionService,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[stepPlanEditorKeyHandler]',
})
export class PlanEditorKeyHandlerDirective {
  constructor(
    private _authService: AuthService,
    @Inject(DOCUMENT) private _document: Document,

    private _planEditorService: PlanEditorService,
    @Optional() private _planInteractiveSession?: PlanInteractiveSessionService,
    @Optional() private _planArtefactResolver?: PlanArtefactResolverService
  ) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey) {
      if (this.checkKey(event, true, ['Up', 'ArrowUp'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.moveInPrevSibling();
        return;
      }

      if (this.checkKey(event, true, ['Down', 'ArrowDown'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.moveInNextSibling();
        return;
      }
    }

    if (event.ctrlKey) {
      if (this.checkKey(event, false, 'z', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.undo();
        return;
      }

      if (this.checkKey(event, false, 'y', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.redo();
        return;
      }

      if (this.checkKey(event, true, ['Left', 'ArrowLeft'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.moveOut();
        return;
      }

      if (this.checkKey(event, true, ['Up', 'ArrowUp'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.moveUp();
        return;
      }

      if (this.checkKey(event, true, ['Down', 'ArrowDown'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.moveDown();
        return;
      }

      if (this.checkKey(event, true, 'c', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.copy();
        return;
      }

      if (this.checkKey(event, true, 'v', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.paste();
        return;
      }

      if (this.checkKey(event, true, 'e', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.toggleSkip();
        return;
      }

      if (this.checkKey(event, true, 'Enter', 'plan-interactive')) {
        event.preventDefault();
        this._planInteractiveSession?.execute();
        return;
      }

      if (this.checkKey(event, true, 'o') && this._planArtefactResolver) {
        event.preventDefault();
        this._planArtefactResolver.openArtefact();
        return;
      }
    }

    if (this.checkKey(event, true, ['Del', 'Delete'], 'plan-delete')) {
      event.preventDefault();
      this._planEditorService.delete();
      return;
    }

    if (this.checkKey(event, true, 'F2', 'plan-write')) {
      event.preventDefault();
      this._planEditorService.rename();
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
