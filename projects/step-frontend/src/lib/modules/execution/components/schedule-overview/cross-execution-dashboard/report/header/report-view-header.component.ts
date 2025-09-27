import { Component, computed, inject, OnInit } from '@angular/core';
import { CrossExecutionDashboardState } from '../../cross-execution-dashboard-state';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ReportNodeSummary } from '../../../../../shared/report-node-summary';
import { FilterUtils, OQLBuilder } from '../../../../../../timeseries/modules/_common';

@Component({
  selector: 'step-scheduler-report-view-header',
  templateUrl: './report-view-header.component.html',
  styleUrls: ['./report-view-header.component.scss'],
  standalone: false,
})
export class ReportViewHeaderComponent {
  readonly _state = inject(CrossExecutionDashboardState);

  successRateValue: Observable<string> = this._state.summaryData$.pipe(
    map((summaryData: ReportNodeSummary) => {
      const passed = summaryData.items['PASSED'];
      if (summaryData.total === 0) {
        return '-';
      }
      return ((passed / summaryData.total) * 100).toFixed(2) + '%';
    }),
    shareReplay(1),
  );

  // averageExecutionDurationValue = this._state.timeRange$.pipe(
  //   switchMap(duration => {
  //     const statusAttribute = 'result';
  //     const oql = new OQLBuilder()
  //       .open('and')
  //       .append('attributes.metricType = "executions/duration"')
  //       .append(FilterUtils.filtersToOQL([this.getDashboardFilter()], 'attributes'))
  //       .build();
  //     const request: FetchBucketsRequest = {
  //       start: timeRange.from,
  //       end: timeRange.to,
  //       numberOfBuckets: 30, // good amount of uplotBarsFn visually
  //       oqlFilter: oql,
  //       groupDimensions: [statusAttribute],
  //     };
  //     return this._timeSeriesService.getTimeSeries(request)
  //   })
  // )
}
