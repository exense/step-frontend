import { Component } from '@angular/core';
import { ExecutionStateService } from '../../services/execution-state.service';
import { Panels } from '../../shared/panels.enum';

@Component({
  selector: 'step-panel-operations',
  templateUrl: './panel-operations.component.html',
  styleUrls: ['./panel-operations.component.scss'],
})
export class PanelOperationsComponent {
  readonly Panels = Panels;

  constructor(public _state: ExecutionStateService) {}
}
