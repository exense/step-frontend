import { Component, input } from '@angular/core';
import { TableDataSource, TimeSeriesErrorEntry } from '@exense/step-core';
import { EXECUTION_ENDED_STATUSES, Status } from '../../../_common/step-common.module';

@Component({
  selector: 'step-alt-execution-errors',
  templateUrl: './alt-execution-errors.component.html',
  styleUrl: './alt-execution-errors.component.scss',
})
export class AltExecutionErrorsComponent {
  /** @Input() **/
  readonly dataSource = input.required<TableDataSource<TimeSeriesErrorEntry>>();

  /** @Input() **/
  readonly showExecutionsMenu = input(true);

  /** @Input() **/
  readonly statusFilterItems = input(EXECUTION_ENDED_STATUSES, {
    transform: (items?: Status[] | null) => (!items?.length ? EXECUTION_ENDED_STATUSES : items) as Status[],
  });
}
