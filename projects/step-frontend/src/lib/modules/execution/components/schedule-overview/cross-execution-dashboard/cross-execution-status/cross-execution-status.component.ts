import { Component, inject } from '@angular/core';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';
import { TimeRange } from '@exense/step-core';
import { take } from 'rxjs';

@Component({
  selector: 'step-cross-execution-status',
  templateUrl: './cross-execution-status.component.html',
  styleUrl: './cross-execution-status.component.scss',
  standalone: false,
})
export class CrossExecutionStatusComponent {
  protected readonly _state = inject(CrossExecutionDashboardState);

  protected handleMainChartZoom(timeRange: TimeRange): void {
    this._state.lastRefreshTrigger.set('manual');
    this._state.executionsChartSettings$.pipe(take(1)).subscribe((chartSettings) => {
      const values = chartSettings.xAxesSettings.values;
      if (values.length < 2) {
        this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: timeRange });
        return;
      }
      const base = values[0];
      const interval = values[1] - values[0];
      if (!interval) {
        this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: timeRange });
        return;
      }
      const snappedFrom = base + Math.ceil((timeRange.from - base) / interval) * interval;
      const snappedTo = base + Math.ceil((timeRange.to - base) / interval) * interval;
      timeRange = { from: Math.round(snappedFrom), to: Math.round(snappedTo) };
      this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: timeRange });
    });
  }
}
