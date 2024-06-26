import { Component, inject } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { ExecutionStateService } from '../../services/execution-state.service';

@Component({
  selector: 'step-dashlet-execution-viz',
  templateUrl: './dashlet-execution-viz.component.html',
  styleUrls: ['./dashlet-execution-viz.component.scss'],
})
export class DashletExecutionVizComponent implements CustomComponent {
  _state = inject(ExecutionStateService);
  context?: any;
}
