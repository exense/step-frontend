import { Component, inject } from '@angular/core';
import { ExecutionStateService } from '../../services/execution-state.service';

/**
 * This class is just responsible to pass the execution input to the execution view so it can react its changes.
 */
@Component({
  selector: 'step-dashlet-execution-viz',
  templateUrl: './dashlet-execution-viz.component.html',
  styleUrls: ['./dashlet-execution-viz.component.scss'],
})
export class DashletExecutionVizComponent {
  _state = inject(ExecutionStateService);
  context?: any;
}
