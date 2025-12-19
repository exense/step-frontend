import { Component, computed, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CrossExecutionDashboardState } from './cross-execution-dashboard-state';
import { IS_SMALL_SCREEN, Tab, TimeUnit } from '@exense/step-core';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Subject } from 'rxjs';
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';

@Component({
  selector: 'step-cross-execution-dashboard',
  templateUrl: './cross-execution-dashboard.component.html',
  styleUrls: ['./cross-execution-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class CrossExecutionDashboardComponent implements OnInit {
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  protected _state = inject(CrossExecutionDashboardState);
  private _urlParamsService = inject(DashboardUrlParamsService);

  private readonly fetchLastExecutionTrigger$ = new Subject<void>();

  protected tabs: Tab<string>[] = [this.createTab('report', 'Report'), this.createTab('performance', 'Performance')];

  viewTitle = computed(() => {
    const isTask = this._state.viewType() === 'task';
    let entity = isTask ? this._state.task() : this._state.plan();
    if (entity === undefined) {
      return 'Loading...';
    } else if (entity === null) {
      return isTask ? 'Deleted task' : 'Deleted plan';
    } else {
      return entity?.attributes?.['name'];
    }
  });

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

  ngOnInit(): void {
    const urlParams = this._urlParamsService.collectUrlParams();
    this.updateTimeAndRefresh(urlParams);
  }

  handleRefreshIntervalChange(interval: number) {
    this._state.lastRefreshTrigger.set('auto');
    this._state.refreshInterval.set(interval);
  }

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this._state.lastRefreshTrigger.set('manual');
    this._state.activeTimeRangeSelection.set(selection);
  }

  triggerRefresh() {
    this._state.lastRefreshTrigger.set('auto');
    this._state.activeTimeRangeSelection.set({ ...this._state.activeTimeRangeSelection()! });
    this.fetchLastExecutionTrigger$.next();
  }

  private updateTimeAndRefresh(urlParams: DashboardUrlParams) {
    if (urlParams.refreshInterval === undefined) {
      urlParams.refreshInterval = 0;
    }
    this._state.refreshInterval.set(urlParams.refreshInterval!);
    if (urlParams.timeRange) {
      let urlTimeRange = urlParams.timeRange!;
      this._state.activeTimeRangeSelection.set(urlTimeRange);
    } else {
      this._state.activeTimeRangeSelection.set(this.timeRangeOptions[1]);
    }
  }

  private createTab(id: string, label: string, link?: string): Tab<string> {
    return {
      id,
      label,
      link: [{ outlets: { primary: link ?? id, modal: null, nodeDetails: null } }],
    };
  }
}
