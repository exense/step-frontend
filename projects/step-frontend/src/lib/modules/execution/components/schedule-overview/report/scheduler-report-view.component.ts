import { Component, inject } from '@angular/core';
import { SchedulerPageStateService } from '../scheduler-page-state.service';
import { TimeRange } from '@exense/step-core';

@Component({
  selector: 'step-scheduler-report-view',
  templateUrl: './scheduler-report-view.component.html',
  styleUrls: ['./scheduler-report-view.component.scss'],
})
export class SchedulerReportViewComponent {
  readonly _stateService = inject(SchedulerPageStateService);

  jumpToExecution(eId: string) {
    window.open(`#/executions/${eId!}/viz`);
  }

  handleMainChartZoom(timeRange: TimeRange) {
    timeRange = { from: Math.round(timeRange.from), to: Math.round(timeRange.to) };
    this._stateService.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: timeRange });
  }
}
