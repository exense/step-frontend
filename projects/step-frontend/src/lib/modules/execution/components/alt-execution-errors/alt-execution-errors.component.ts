import { Component, input } from '@angular/core';
import { TableDataSource, TimeSeriesErrorEntry } from '@exense/step-core';

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
}
