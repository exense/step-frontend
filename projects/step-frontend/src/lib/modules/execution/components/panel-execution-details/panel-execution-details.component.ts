import { Component, inject } from '@angular/core';
import { ExecutionStateService } from '../../services/execution-state.service';
import { Panels } from '../../shared/panels.enum';

@Component({
  selector: 'step-panel-execution-details',
  templateUrl: './panel-execution-details.component.html',
  styleUrls: ['./panel-execution-details.component.scss'],
})
export class PanelExecutionDetailsComponent {
  readonly Panels = Panels;
  public _state = inject(ExecutionStateService);
}
