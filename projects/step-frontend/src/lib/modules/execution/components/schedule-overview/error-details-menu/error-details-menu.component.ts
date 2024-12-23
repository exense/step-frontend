import { Component, effect, inject, input } from '@angular/core';
import { Execution } from '@exense/step-core';
import { TimeSeriesEntityService } from '../../../../timeseries/modules/_common';

@Component({
  selector: 'step-error-details-menu',
  templateUrl: './error-details-menu.component.html',
  styleUrls: ['./error-details-menu.component.scss'],
})
export class ErrorDetailsMenuComponent {
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);

  executionIds = input<string[]>([]);

  executions: Execution[] = [];

  private fetchExecutionsEffect = effect(() => {
    let ids = this.executionIds();
    if (ids && ids.length > 0) {
      this._timeSeriesEntityService.getExecutions(ids).subscribe((executions) => (this.executions = executions));
    }
  });
}
