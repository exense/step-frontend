import { Component, inject } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { ExecutionStateService } from '../../services/execution-state.service';

@Component({
  selector: 'step-dashlet-execution-step',
  templateUrl: './dashlet-execution-step.component.html',
  styleUrls: ['./dashlet-execution-step.component.scss'],
  standalone: false,
})
export class DashletExecutionStepComponent implements CustomComponent {
  protected readonly _state = inject(ExecutionStateService);
  context?: any;
}
