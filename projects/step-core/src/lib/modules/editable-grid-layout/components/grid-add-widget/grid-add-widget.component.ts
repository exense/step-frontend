import {Component, inject} from '@angular/core';
import {WidgetsVisibilityStateService} from '../../injectables/widgets-visibility-state.service';
import {StepBasicsModule} from '../../../basics/step-basics.module';

@Component({
  selector: 'step-grid-add-widget',
  imports: [StepBasicsModule],
  templateUrl: './grid-add-widget.component.html',
  styleUrl: './grid-add-widget.component.scss'
})
export class GridAddWidgetComponent {
  private _widgetsVisibility = inject(WidgetsVisibilityStateService);

  protected readonly widgets = this._widgetsVisibility.visibilityInfo;

  protected addWidget(id: string): void {
    this._widgetsVisibility.show(id);
  }
}
