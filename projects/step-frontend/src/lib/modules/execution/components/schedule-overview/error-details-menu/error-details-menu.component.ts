import { Component, effect, inject, input, signal } from '@angular/core';
import { DateFormat, Execution } from '@exense/step-core';
import { TimeSeriesEntityService } from '../../../../timeseries/modules/_common';

@Component({
  selector: 'step-error-details-menu',
  templateUrl: './error-details-menu.component.html',
  styleUrls: ['./error-details-menu.component.scss'],
})
export class ErrorDetailsMenuComponent {
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly DateFormat = DateFormat;

  executionIds = input<string[]>([]);
  loading = signal(false);

  executions: Execution[] = [];

  private fetchExecutionsEffect = effect(() => {
    let ids = this.executionIds();
    this.executions = [];
    if (ids && ids.length > 0) {
      this._timeSeriesEntityService.getExecutions(ids).subscribe(
        (executions) => {
          this.executions = executions;
          this.executions.sort((e1, e2) => (e1.startTime! = e2.startTime!));
          this.loading.set(false);
        },
        (error) => {
          this.loading.set(false);
        },
      );
    }
  });

  jumpToExecution(eId: string) {
    window.open(`#/executions/${eId!}/viz`);
  }
}
