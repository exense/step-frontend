import { Component, inject, untracked } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';
import { GridElementComponent } from '../grid-element/grid-element.component';

@Component({
  selector: 'step-grid-element-remove',
  imports: [StepBasicsModule],
  templateUrl: './grid-element-remove.component.html',
  styleUrl: './grid-element-remove.component.scss',
  host: {
    '(mousedown)': 'hideWidget($event)',
  },
})
export class GridElementRemoveComponent {
  private _gridElement = inject(GridElementComponent);
  private _widgetPositions = inject(WidgetsPositionsStateService);

  protected hideWidget($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    const elementId = untracked(() => this._gridElement.elementId());
    this._widgetPositions.remove(elementId);
  }
}
