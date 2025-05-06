import { defaultIfEmpty, forkJoin, merge, Observable, of, skip, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TimeSeriesUtils } from '../../modules/_common';
import { TimeRange, TimeRangeSelection, TimeSeriesAPIResponse } from '@exense/step-core';
import { DashboardState } from './dashboard-state';
import { DashboardTimeRangeSettings } from './dashboard-time-range-settings';
import { TimeRangeType } from './time-range-type';
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';

export class DashboardStateEngine {
  private terminator$ = new Subject<void>();
  state: DashboardState;

  constructor(state: DashboardState) {
    this.state = state;
  }

  destroy() {
    this.terminator$.next();
    this.terminator$.complete();
  }

  subscribeForContextChange(): void {
    const context = this.state.context;
    merge(
      context.onGroupingChange(),
      context.onFilteringChange(),
      context.onChartsResolutionChange(),
      context.onTimeSelectionChange(),
      context.onFullRangeChange(),
    )
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        this.refreshAllCharts(false, true);
      });
  }

  handleTimeRangePickerChange(selection: TimeRangePickerSelection) {
    let timeRange: TimeRange;
    switch (selection.type) {
      case 'ABSOLUTE':
        timeRange = selection.absoluteSelection!;
        break;
      case 'RELATIVE':
        const now = new Date().getTime();
        timeRange = { from: now - selection.relativeSelection!.timeInMs, to: now };
        break;
      default:
        throw new Error('Unsupported type ' + selection.type);
    }
    const timeRangeSettings: DashboardTimeRangeSettings = {
      timeRangeSelection: selection,
      fullRange: timeRange,
      selectedRange: timeRange,
    };
    this.state.context.updateTimeRangeSettings(timeRangeSettings);
  }

  triggerRefresh(force: boolean = false) {
    const state = this.state;
    if (state.context.compareModeChange$.getValue().enabled) {
      // refresh is not enabled on compare mode
      return;
    }
    if ((state.refreshInProgress || state.context.getChartsLockedState()) && !force) {
      return;
    }
    // TODO make sure the selected range is smaller or equal to full range
    this.refreshAllCharts(true, force);
  }

  /**
   * @param refreshRanger. Set true if ranger data has to be updated
   * @param force. If set to false (default), the refresh will be skipped if there is a refresh in progress.
   * @private
   */
  public refreshAllCharts(refreshRanger = false, force = false): void {
    const state = this.state;
    state.refreshSubscription?.unsubscribe();
    state.refreshInProgress = true;
    state.refreshSubscription = of(null)
      .pipe(
        tap(() => (state.refreshInProgress = true)),
        switchMap(() => {
          const dashlets$ = state.getDashlets().map((dashlet) => dashlet.refresh());
          if (refreshRanger) {
            dashlets$.push(this.refreshRanger());
          }
          return forkJoin(dashlets$).pipe(defaultIfEmpty([]));
        }),
        tap(() => (state.refreshInProgress = false)),
        takeUntil(this.terminator$),
      )
      .subscribe();
  }

  refreshRanger(): Observable<TimeSeriesAPIResponse> {
    return this.state.getRanger()?.refreshRanger();
  }
}
