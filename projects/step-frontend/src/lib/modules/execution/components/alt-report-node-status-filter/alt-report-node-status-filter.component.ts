import { Component, inject } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { Status } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-alt-report-node-status-filter',
  templateUrl: './alt-report-node-status-filter.component.html',
  styleUrl: './alt-report-node-status-filter.component.scss',
})
export class AltReportNodeStatusFilterComponent {
  protected readonly _state = inject(AltReportNodesStateService);

  // Angular doesn't synchronize multiple inputs, if [formControl] is used.
  // To avoid it value is extracted from control and bound with [ngModel].
  protected readonly statuses = this._state.statusCtrlValue;

  protected handleStatusChange(statuses: Status[]): void {
    this._state.statusesCtrl.setValue(statuses);
  }
}
