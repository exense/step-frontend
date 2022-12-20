import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { ExecutionStateService } from '../../services/execution-state.service';
import { Panels } from '../../shared/panels.enum';

@Component({
  selector: 'step-dashlet-execution-tree',
  templateUrl: './dashlet-execution-tree.component.html',
  styleUrls: ['./dashlet-execution-tree.component.scss'],
})
export class DashletExecutionTreeComponent implements CustomComponent {
  context?: any;
  readonly Panels = Panels;

  constructor(public _state: ExecutionStateService) {}
}
