import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { ExecutionStateService } from '../../services/execution-state.service';

@Component({
  selector: 'step-dashlet-execution-errors',
  templateUrl: './dashlet-execution-errors.component.html',
  styleUrls: ['./dashlet-execution-errors.component.scss'],
})
export class DashletExecutionErrorsComponent implements CustomComponent {
  context?: any;

  constructor(public _state: ExecutionStateService) {}
}
