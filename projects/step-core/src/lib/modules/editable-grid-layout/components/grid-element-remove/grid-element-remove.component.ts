import {Component, inject, untracked} from '@angular/core';
import {StepBasicsModule} from '../../../basics/step-basics.module';
import {WidgetsPositionsStateService} from '../../injectables/widgets-positions-state.service';
import {GridElementDirective} from '../../directives/grid-element.directive';

@Component({
  selector: 'step-grid-element-remove',
  imports: [
    StepBasicsModule
  ],
  templateUrl: './grid-element-remove.component.html',
  styleUrl: './grid-element-remove.component.scss',
  host: {
    '(mousedown)': 'hideWidget($event)'
  }
})
export class GridElementRemoveComponent {

  private _gridElement = inject(GridElementDirective);
  private _widgetPositions = inject(WidgetsPositionsStateService);

  protected hideWidget($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    const elementId = untracked(() => this._gridElement.elementId());
    this._widgetPositions.hide(elementId);
  }

}
