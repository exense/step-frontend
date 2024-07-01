import { defaultIfEmpty, forkJoin, merge, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TimeRangePickerSelection, TimeSeriesUtils } from '../../modules/_common';
import { TimeRange, TimeRangeSelection, TimeSeriesAPIResponse } from '@exense/step-core';
import { DashboardState } from './dashboard-state';

export class DashboardStateEngine {
  private terminator$ = new Subject<void>();
  state: DashboardState;

  constructor(state: DashboardState) {
    this.state = state;
  }

  destroy() {
    this.terminator$.next();
    this.terminator$.complete();
    // this.state.context.destroy();
  }

  subscribeForContextChange(): void {
    const context = this.state.context;
    merge(
      context.onFilteringChange(),
      context.onGroupingChange(),
      context.onChartsResolutionChange(),
      context.onTimeSelectionChange(),
    )
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        this.refreshAllCharts(false, true);
      });
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
    let newRange: TimeRange;
    const timeRangeSettings = state.context.getTimeRangeSettings();
    if (timeRangeSettings.type === 'FULL' && timeRangeSettings.defaultFullRange?.from) {
      const defaultFullTimeRange = timeRangeSettings.defaultFullRange!;
      newRange = { from: defaultFullTimeRange.from!, to: defaultFullTimeRange.to || new Date().getTime() };
    } else {
      newRange = TimeSeriesUtils.convertSelectionToTimeRange(state.timeRangeSelection);
    }

    this.updateFullAndSelectedRange(newRange);
    this.refreshAllCharts(true, force);
  }

  /**
   * If the current selection is full, this method will preserve the full selection, no matter of the new range.
   * If there is a custom selection, it will try to be preserved, cropping it if needed.
   * If the current selection does not fit into the new range, the full selection will be set instead
   */
  updateFullAndSelectedRange(fullRange: TimeRange) {
    const context = this.state.context;
    const isFullRangeSelected = context.isFullRangeSelected();
    if (isFullRangeSelected) {
      context.updateFullRange(fullRange, false);
      context.updateSelectedRange(fullRange, false);
    } else {
      let newSelection = context.getSelectedTimeRange();
      // we crop it
      const newFrom = Math.max(fullRange.from!, newSelection.from!);
      const newTo = Math.min(fullRange.to!, newSelection.to!);
      if (newTo - newFrom < 3) {
        newSelection = fullRange; // zoom reset when the interval is very small
      } else {
        newSelection = { from: newFrom, to: newTo };
      }
      context.updateFullRange(fullRange, false);
      context.updateSelectedRange(newSelection, false);
    }
  }

  /**
   * Handle full range interval changes, not selection changes.
   */
  handleTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    const state = this.state;
    const range = this.getTimeRangeFromTimeSelection(params.selection);
    state.timeRangeSelection = params.selection;
    state.context.updateFullRange(range, false);
    state.context.updateSelectedRange(range, false);
    this.refreshRanger().subscribe();
    this.refreshAllCharts(true, true);
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
    return this.state.getFilterBar().timeSelection!.refreshRanger();
  }

  private getTimeRangeFromTimeSelection(selection: TimeRangeSelection): TimeRange {
    const timeRangeSettings = this.state.context.getTimeRangeSettings();
    switch (selection.type) {
      case 'FULL':
        if (!timeRangeSettings.defaultFullRange?.from) {
          throw new Error('Default full time range is not set before using "FULL" selection');
        }
        return {
          from: timeRangeSettings.defaultFullRange!.from!,
          to: timeRangeSettings.defaultFullRange?.to || new Date().getTime(),
        };
      case 'ABSOLUTE':
        return { from: selection.absoluteSelection!.from!, to: selection.absoluteSelection!.to! };
      case 'RELATIVE':
        let now = new Date().getTime();
        return { from: now - selection.relativeSelection!.timeInMs!, to: now };
      default:
        throw new Error('Unsupported time selection type: ' + selection.type);
    }
  }
}
