import { Component, computed, inject, OnInit } from '@angular/core';
import { CrossExecutionDashboardState } from '../../cross-execution-dashboard-state';
import { map, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-scheduler-report-view-header',
  templateUrl: './report-view-header.component.html',
  styleUrls: ['./report-view-header.component.scss'],
  standalone: false,
})
export class ReportViewHeaderComponent {
  readonly _state = inject(CrossExecutionDashboardState);

  successRateData = this._state.summaryData$.pipe(
    map((summaryData) => {
      console.log(summaryData);
      return of();
    }),
  );
}
