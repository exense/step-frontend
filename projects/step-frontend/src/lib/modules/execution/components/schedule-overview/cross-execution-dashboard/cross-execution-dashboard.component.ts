import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CrossExecutionDashboardState } from './cross-execution-dashboard-state';
import { IS_SMALL_SCREEN, Tab, TimeUnit } from '@exense/step-core';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Subject } from 'rxjs';

@Component({
  selector: 'step-cross-execution-dashboard',
  templateUrl: './cross-execution-dashboard.component.html',
  styleUrls: ['./cross-execution-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CrossExecutionDashboardComponent {
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  _state = inject(CrossExecutionDashboardState);

  private readonly fetchLastExecutionTrigger$ = new Subject<void>();

  protected tabs: Tab<string>[] = [this.createTab('report', 'Report'), this.createTab('performance', 'Performance')];

  readonly timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 day', timeInMs: TimeUnit.DAY } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 week', timeInMs: TimeUnit.WEEK } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 2 weeks', timeInMs: TimeUnit.WEEK * 2 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 month', timeInMs: TimeUnit.MONTH } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 months', timeInMs: TimeUnit.MONTH * 3 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 6 months', timeInMs: TimeUnit.MONTH * 6 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 year', timeInMs: TimeUnit.YEAR } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 years', timeInMs: TimeUnit.YEAR * 3 } },
  ];

  handleRefreshIntervalChange(interval: number) {
    this._state.refreshInterval.set(interval);
  }

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this._state.activeTimeRangeSelection.set(selection);
  }

  triggerRefresh() {
    this._state.activeTimeRangeSelection.set({ ...this._state.activeTimeRangeSelection()! });
    this.fetchLastExecutionTrigger$.next();
  }

  private createTab(id: string, label: string, link?: string): Tab<string> {
    return {
      id,
      label,
      link: [{ outlets: { primary: link ?? id, modal: null, nodeDetails: null } }],
    };
  }
}
