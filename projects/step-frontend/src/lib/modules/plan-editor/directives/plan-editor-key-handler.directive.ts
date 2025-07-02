import { Directive, forwardRef, HostListener, inject } from '@angular/core';
import {
  AuthService,
  PlanArtefactResolverService,
  PlanEditorService,
  PlanInteractiveSessionService,
  TreeFocusStateService,
} from '@exense/step-core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[stepPlanEditorKeyHandler]',
  providers: [
    {
      provide: TreeFocusStateService,
      useExisting: forwardRef(() => PlanEditorKeyHandlerDirective),
    },
  ],
  standalone: false,
})
export class PlanEditorKeyHandlerDirective implements TreeFocusStateService {
  private _authService = inject(AuthService);
  private _document = inject(DOCUMENT);

  private _planEditorService = inject(PlanEditorService);
  private _planInteractiveSession = inject(PlanInteractiveSessionService, { optional: true });
  private _planArtefactResolver = inject(PlanArtefactResolverService, { optional: true });

  private isTreeInFocus = false;

  setTreeFocus(isInFocus: boolean): void {
    this.isTreeInFocus = isInFocus;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const isCtrl = event.metaKey || event.ctrlKey;

    // If text selection exits, ignore this handler for ctrl+c & ctrl+v shortcuts, to prevent native event cancellation
    const hasTextSelection = !!this._document.defaultView?.getSelection()?.toString();

    if (isCtrl && event.shiftKey) {
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

      if (!hasTextSelection && this.checkKey(event, true, ['v', 'V'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.pasteAfter();
        return;
      }
    }

    if (isCtrl) {
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

      if (this.checkKey(event, true, ['Right', 'ArrowRight'], 'plan-write')) {
        event.preventDefault();
        this._planEditorService.moveInPrevSibling();
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

      if (!hasTextSelection && this.checkKey(event, true, 'c', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.copy();
        return;
      }

      if (!hasTextSelection && this.checkKey(event, true, 'v', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.paste();
        return;
      }

      if (this.checkKey(event, true, 'e', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.toggleSkip();
        return;
      }

      if (this.checkKey(event, true, 'd', 'plan-write')) {
        event.preventDefault();
        this._planEditorService.duplicate();
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
    rights?: string | string[],
  ): boolean {
    if (isEmitByTreeOnly && !this.isTreeInFocus) {
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
