import { Directive, inject, untracked } from '@angular/core';
import { GridElementDragService } from '../injectables/grid-element-drag.service';
import { GridEditableService } from '../injectables/grid-editable.service';
import { GridElementDirective } from './grid-element.directive';

@Directive({
  selector: '[stepGridDragHandle]',
  host: {
    class: 'step-grid-drag-handle',
    '(mousedown)': 'handleMouseDown($event)',
  },
})
export class GridDragHandleDirective {
  private _gridElement = inject(GridElementDirective);
  private _gridElementDrag = inject(GridElementDragService);
  private _gridEditable = inject(GridEditableService);

  protected handleMouseDown(event: MouseEvent): void {
    const isEditMode = untracked(() => this._gridEditable.editMode());
    if (!isEditMode) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this._gridElementDrag.dragStart(this._gridElement._elRef.nativeElement, event);
  }
}
