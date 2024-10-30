import { defaultIfEmpty, forkJoin, merge, Observable, of, skip, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TimeRangePickerSelection, TimeSeriesUtils } from '../../modules/_common';
import { TimeRange, TimeRangeSelection, TimeSeriesAPIResponse } from '@exense/step-core';
import { DashboardState } from './dashboard-state';
import { DashboardTimeRangeSettings } from './dashboard-time-range-settings';
import { TimeRangeType } from './time-range-type';

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
    const timeRangeSettings = state.context.getTimeRangeSettings();
    const now = new Date().getTime() - 5000;
    switch (timeRangeSettings.type) {
      case 'FULL':
        if (timeRangeSettings.defaultFullRange?.from && !timeRangeSettings.defaultFullRange?.to) {
          timeRangeSettings.fullRange.to = now;
        }
        break;
      case 'ABSOLUTE':
        break;
      case 'RELATIVE':
        const isFullTimeSelection = TimeSeriesUtils.intervalsEqual(
          timeRangeSettings.selectedRange,
          timeRangeSettings.fullRange,
        );
        const fullRange = { from: now - timeRangeSettings.relativeSelection!.timeInMs, to: now };
        timeRangeSettings.fullRange = fullRange;
        if (isFullTimeSelection) {
          timeRangeSettings.selectedRange = { ...timeRangeSettings.fullRange };
        } else {
          // we have a custom selection. has to be cropped if needed
          const croppedSelection = TimeSeriesUtils.cropInterval(timeRangeSettings.selectedRange, fullRange);
          if (croppedSelection) {
            timeRangeSettings.selectedRange = croppedSelection;
          } else {
            timeRangeSettings.selectedRange = { ...timeRangeSettings.fullRange }; // zoom reset when the interval is very small
          }
        }
        break;
    }
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
    const oldSettings = this.state.context.getTimeRangeSettings();
    let newSettings: DashboardTimeRangeSettings;
    switch (params.selection.type) {
      case 'FULL':
        const fullRange = {
          from: oldSettings.defaultFullRange!.from!,
          to: oldSettings.defaultFullRange?.to || new Date().getTime(),
        };
        newSettings = {
          type: TimeRangeType.FULL,
          defaultFullRange: oldSettings.defaultFullRange,
          fullRange: fullRange,
          selectedRange: fullRange,
        };
        break;
      case 'ABSOLUTE':
        newSettings = {
          type: TimeRangeType.ABSOLUTE,
          defaultFullRange: oldSettings.defaultFullRange,
          fullRange: params.selection.absoluteSelection!,
          selectedRange: params.selection.absoluteSelection!,
        };
        break;
      case 'RELATIVE':
        const relativeSelection = params.selection.relativeSelection!;
        const now = new Date().getTime();
        const from = now - relativeSelection!.timeInMs!;
        newSettings = {
          type: TimeRangeType.RELATIVE,
          defaultFullRange: oldSettings.defaultFullRange,
          fullRange: { from: from, to: now },
          selectedRange: { from: from, to: now },
          relativeSelection: relativeSelection,
        };
        break;
    }
    this.state.context.updateTimeRangeSettings(newSettings);
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

  private getFullRangeFromTimeSelection(selection: TimeRangeSelection): TimeRange {
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
        const now = new Date().getTime();
        return { from: now - selection.relativeSelection!.timeInMs!, to: now };
      default:
        throw new Error('Unsupported time selection type: ' + selection.type);
    }
  }
}
