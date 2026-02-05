import { Component, inject, untracked } from '@angular/core';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { GridElementDirective } from '../../directives/grid-element.directive';
import { GridElementResizerService } from '../../injectables/grid-element-resizer.service';
import { GridEditableService } from '../../injectables/grid-editable.service';

@Component({
  selector: 'step-grid-resizer',
  imports: [StepIconsModule],
  templateUrl: './grid-resizer.component.html',
  styleUrl: './grid-resizer.component.scss',
  host: {
    '(mousedown)': 'handleMouseDown($event)',
  },
})
export class GridResizerComponent {
  private _gridElement = inject(GridElementDirective);
  private _gridElementResizer = inject(GridElementResizerService);
  private _gridEditable = inject(GridEditableService);

  protected handleMouseDown(event: MouseEvent): void {
    const isEditMode = untracked(() => this._gridEditable.editMode());
    if (!isEditMode) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this._gridElementResizer.resizeStart(this._gridElement._elRef.nativeElement);
  }
}
