import { Component, inject } from '@angular/core';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { GridElementDirective } from '../../directives/grid-element.directive';
import { GridElementResizerService } from '../../injectables/grid-element-resizer.service';

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

  protected handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._gridElementResizer.resizeStart(this._gridElement._elRef.nativeElement);
  }
}
