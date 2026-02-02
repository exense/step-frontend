import { Directive, inject } from '@angular/core';
import { GridElementDragService } from '../injectables/grid-element-drag.service';
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

  protected handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._gridElementDrag.dragStart(this._gridElement._elRef.nativeElement);
  }
}
