import { Component } from '@angular/core';
import { CustomComponent, ReportNode, SelectionCollector } from '@exense/step-core';
import { ExecutionStateService } from '../../services/execution-state.service';

@Component({
  selector: 'step-dashlet-execution-step',
  templateUrl: './dashlet-execution-step.component.html',
  styleUrls: ['./dashlet-execution-step.component.scss'],
})
export class DashletExecutionStepComponent implements CustomComponent {
  context?: any;

  constructor(
    public state: ExecutionStateService,
    public _testCasesSelection: SelectionCollector<string, ReportNode>
  ) {}
}
