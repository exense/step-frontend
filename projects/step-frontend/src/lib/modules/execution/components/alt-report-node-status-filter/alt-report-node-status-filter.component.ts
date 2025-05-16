import { Component, inject } from '@angular/core';
import { Status } from '../../../_common/shared/status.enum';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';

@Component({
  selector: 'step-alt-report-node-status-filter',
  templateUrl: './alt-report-node-status-filter.component.html',
  styleUrl: './alt-report-node-status-filter.component.scss',
})
export class AltReportNodeStatusFilterComponent {
  protected readonly _state = inject(AltReportNodesFilterService);

  // Angular doesn't synchronize multiple inputs, if [formControl] is used.
  // To avoid it value is extracted from control and bound with [ngModel].
  protected readonly statuses = this._state.statusCtrlValue;

  protected handleStatusChange(statuses: Status[]): void {
    this._state.statusesCtrl.setValue(statuses);
  }
}
