import { Component, inject } from '@angular/core';
import { ExecutionStateService } from '../../services/execution-state.service';
import { Panels } from '../../shared/panels.enum';

@Component({
  selector: 'step-panel-operations',
  templateUrl: './panel-operations.component.html',
  styleUrls: ['./panel-operations.component.scss'],
  standalone: false,
})
export class PanelOperationsComponent {
  readonly Panels = Panels;

  _state = inject(ExecutionStateService);
}
