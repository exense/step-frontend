import { Component, inject } from '@angular/core';
import { ExecutionStateService } from '../../services/execution-state.service';
import { CustomComponent } from '@exense/step-core';

/**
 * This class is just responsible to pass the execution input to the execution view so it can react its changes.
 */
@Component({
  selector: 'step-dashlet-execution-viz',
  templateUrl: './dashlet-execution-viz.component.html',
  styleUrls: ['./dashlet-execution-viz.component.scss'],
  standalone: false,
})
export class DashletExecutionVizComponent implements CustomComponent {
  _state = inject(ExecutionStateService);
  context?: any;
}
