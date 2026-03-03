import { Component, input, output } from '@angular/core';
import { Status } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-report-node-status-filter-control',
  templateUrl: './report-node-status-filter-control.component.html',
  styleUrl: './report-node-status-filter-control.component.scss',
  standalone: false,
})
export class ReportNodeStatusFilterControlComponent {
  readonly statuses = input.required<Status[]>();
  readonly items = input.required<readonly Status[]>();
  readonly isErrorFilterActive = input(false);
  readonly errorFilterTooltip = input('Filter for all error statuses');
  readonly emptyPlaceholder = input('Status');

  readonly statusesChange = output<Status[]>();
  readonly toggleErrorStatuses = output<void>();

  protected handleStatusChange(statuses: Status[]): void {
    this.statusesChange.emit(statuses);
  }

  protected onToggleErrorStatuses(): void {
    this.toggleErrorStatuses.emit();
  }
}
