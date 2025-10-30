import { Component, computed, inject, OnInit } from '@angular/core';
import { CrossExecutionDashboardState } from '../../cross-execution-dashboard-state';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ReportNodeSummary } from '../../../../../shared/report-node-summary';
import { FilterUtils, OQLBuilder, TimeSeriesConfig } from '../../../../../../timeseries/modules/_common';
import { BucketResponse } from '@exense/step-core';

@Component({
  selector: 'step-scheduler-report-view-header',
  templateUrl: './report-view-header.component.html',
  styleUrls: ['./report-view-header.component.scss'],
  standalone: false,
})
export class ReportViewHeaderComponent {
  readonly _state = inject(CrossExecutionDashboardState);

  successRateValue$: Observable<string> = this._state.summaryData$.pipe(
    map((summaryData: ReportNodeSummary) => {
      const passed = summaryData.items['PASSED'] || 0;
      if (summaryData.total === 0) {
        return '-';
      }
      return ((passed / summaryData.total) * 100).toFixed(2) + '%';
    }),
    shareReplay(1),
  );

  averageExecutionDurationLabel$ = this._state.executionsDurationTimeSeriesData.pipe(
    map((response) => {
      // data is grouped by status
      let totalCount = 0;
      let totalDuration = 0;
      response.matrixKeys.forEach((keyAttributes, i) => {
        let bucket: BucketResponse = response.matrix[i][0];
        totalCount += bucket.count;
        totalDuration += bucket.sum;
      });
      if (totalCount === 0) {
        return '-';
      } else {
        return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time(totalDuration / totalCount);
      }
    }),
    shareReplay(1),
  );

  totalExecutionsCount$ = this._state.executionsDurationTimeSeriesData.pipe(
    map((response) => {
      let totalCount = 0;
      response.matrixKeys.forEach((keyAttributes, i) => {
        let bucket: BucketResponse = response.matrix[i][0];
        totalCount += bucket.count;
      });
      return totalCount;
    }),
    shareReplay(1),
  );
}
