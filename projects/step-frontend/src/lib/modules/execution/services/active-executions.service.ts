import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  ApiError,
  AugmentedExecutionsService,
  AutoRefreshModel,
  AutoRefreshModelFactoryService,
  Execution,
  ExecutionOverview,
  ResolvedExecutionNotice,
  durationSwitchMap,
  Reloadable,
  GlobalReloadService,
} from '@exense/step-core';
import { BehaviorSubject, concatMap, filter, Observable, of, startWith, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpStatusCode } from '@angular/common/http';
import { TimeRangePickerSelection } from '../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';

type LoadedExecutionOverview = ExecutionOverview & { execution: Execution };

export interface ActiveExecution {
  readonly executionId: string;
  readonly execution$: Observable<Execution>;
  readonly resolvedNotices$: Observable<ResolvedExecutionNotice[]>;
  readonly autoRefreshModel: AutoRefreshModel;
  readonly timeRangeSelectionChange$: Observable<TimeRangePickerSelection>;
  readonly performanceTabSettings: PerformanceTabSettings;

  updateTimeRange(timeRangeSelection: TimeRangePickerSelection): void;
  getTimeRangeSelection(): TimeRangePickerSelection;
  updateChartsResolution(resolution: number): void;
  updateCompareModeEnabled(enabled: boolean): void;
  adjustAutoRefresh(requestDuration: number): void;
  destroy(): void;
  manualRefresh(): void;
}

interface PerformanceTabSettings {
  resolution: number;
  compareModeEnabled: boolean;
}

class ActiveExecutionImpl implements ActiveExecution {
  constructor(
    readonly executionId: string,
    readonly autoRefreshModel: AutoRefreshModel,
    private loadOverview: (eId: string) => Observable<ExecutionOverview>,
  ) {
    this.setupExecutionRefresh();
  }
  private timeRangeSelectionInternal$ = new BehaviorSubject<TimeRangePickerSelection>({ type: 'FULL' });
  readonly timeRangeSelectionChange$ = this.timeRangeSelectionInternal$.asObservable();
  readonly performanceTabSettings: PerformanceTabSettings = { resolution: 0, compareModeEnabled: false };

  private executionInternal$ = new BehaviorSubject<Execution | undefined>(undefined);

  readonly execution$ = this.executionInternal$.pipe(filter((execution) => !!execution)) as Observable<Execution>;

  private noticesInternal$ = new BehaviorSubject<ResolvedExecutionNotice[]>([]);
  readonly resolvedNotices$ = this.noticesInternal$.asObservable();

  updateTimeRange(timeRangeSelection: TimeRangePickerSelection): void {
    this.timeRangeSelectionInternal$.next(timeRangeSelection);
  }

  getTimeRangeSelection(): TimeRangePickerSelection {
    return this.timeRangeSelectionInternal$.getValue();
  }

  destroy(): void {
    this.executionInternal$.complete();
    this.noticesInternal$.complete();
    this.autoRefreshModel.destroy();
    this.timeRangeSelectionInternal$.complete();
  }

  private setupExecutionRefresh(): void {
    if (this.executionId === 'open') {
      return;
    }

    // Configure the auto-refresh model BEFORE subscribing. The startWith below triggers the first load
    // synchronously on subscribe; when that load reuses the cached overview it completes synchronously
    // and an ENDED execution disables auto-refresh right away. Doing the configuration afterwards would
    // re-enable it (setDisabled(false) emits a refresh), causing a redundant second load.
    this.autoRefreshModel.setDisabled(false);
    this.autoRefreshModel.setInterval(100);
    this.autoRefreshModel.setAutoIncreaseTo(5000);
    this.autoRefreshModel.refresh$
      .pipe(
        startWith(() => undefined),
        concatMap(() => {
          return of(this.executionId).pipe(
            durationSwitchMap(
              (executionId) => this.loadOverview(executionId),
              (requestDuration) => this.adjustAutoRefresh(requestDuration),
            ),
          );
        }),
      )
      .subscribe((overview) => {
        const loadedOverview = requireExecution(overview);
        const execution = loadedOverview.execution;
        this.executionInternal$.next(execution);
        this.noticesInternal$.next(loadedOverview.resolvedNotices ?? []);
        if (execution.status === 'ENDED') {
          this.autoRefreshModel.setDisabled(true);
          this.autoRefreshModel.setInterval(0);
          this.autoRefreshModel.setAutoIncreaseTo(0);
        }
      });
  }

  adjustAutoRefresh(requestDuration: number): void {
    // If auto-refresh has been disabled, don't set new interval
    // Otherwise it may restart the timer
    if (this.autoRefreshModel.disabled) {
      return;
    }

    const durationAndIntervals = [
      2500,
      5_000,
      10_000,
      5_000,
      15_000,
      30_000,
      15_000,
      30_000,
      60_000,
      30_000,
      Infinity,
      300_000,
    ];

    for (let i = 0; i < durationAndIntervals.length - 3; i += 3) {
      const [min, max, result] = durationAndIntervals.slice(i, i + 3);
      if (requestDuration >= min && requestDuration < max) {
        // In case of manuallyChanged value auto-update model only if selected model's interval is lower than calculated one.
        if (this.autoRefreshModel.isManuallyChanged && this.autoRefreshModel.interval >= result) {
          break;
        }

        this.autoRefreshModel.setInterval(result);
        this.autoRefreshModel.setAutoIncreaseTo(result);
        break;
      }
    }
  }

  manualRefresh(): void {
    this.loadOverview(this.executionId).subscribe((overview) => {
      const loadedOverview = requireExecution(overview);
      this.executionInternal$.next(loadedOverview.execution);
      this.noticesInternal$.next(loadedOverview.resolvedNotices ?? []);
      this.timeRangeSelectionInternal$.next(this.timeRangeSelectionInternal$.value);
    });
  }

  updateChartsResolution(resolution: number): void {
    this.performanceTabSettings.resolution = resolution;
  }

  updateCompareModeEnabled(enabled: boolean): void {
    this.performanceTabSettings.compareModeEnabled = enabled;
  }
}

function requireExecution(overview: ExecutionOverview): LoadedExecutionOverview {
  if (!overview.execution) {
    throw new Error('Execution overview response does not include an execution.');
  }
  return overview as LoadedExecutionOverview;
}

@Injectable()
export class ActiveExecutionsService implements OnDestroy, Reloadable {
  private _executionService = inject(AugmentedExecutionsService);
  private _autoRefreshFactory = inject(AutoRefreshModelFactoryService);
  private _globalReload = inject(GlobalReloadService);

  private executions = new Map<string, ActiveExecution>();
  private autoCloseExecutionInternal$ = new Subject<string>();
  readonly autoCloseExecution$ = this.autoCloseExecutionInternal$.asObservable();

  constructor() {
    this._globalReload.register(this);
  }

  getActiveExecution(executionId: string): ActiveExecution {
    if (!this.executions.has(executionId)) {
      this.executions.set(executionId, this.createActiveExecution(executionId));
    }
    return this.executions.get(executionId)!;
  }

  removeActiveExecution(executionId: string): void {
    if (!this.executions.has(executionId)) {
      return;
    }
    const execution = this.executions.get(executionId)!;
    execution.destroy();
    this.executions.delete(executionId);
  }

  hasExecution(executionId: string): boolean {
    return this.executions.has(executionId);
  }

  activeExecutionIds(): string[] {
    return Array.from(this.executions.keys());
  }

  size(): number {
    return this.executions.size;
  }

  ngOnDestroy(): void {
    this._globalReload.unRegister(this);
    this.autoCloseExecutionInternal$.complete();
    this.cleanup();
  }

  cleanup(): boolean {
    this.executions.forEach((activeExecution) => activeExecution.destroy());
    this.executions.clear();
    return true;
  }

  reload(isCausedByProjectChange?: boolean): void {
    if (!isCausedByProjectChange) {
      return;
    }
    this.cleanup();
  }

  private createActiveExecution(executionId: string): ActiveExecution {
    const autoRefreshModel = this._autoRefreshFactory.create();
    // The first load reuses the overview already fetched by the route guards (cached), so opening an
    // execution issues a single /overview request. Subsequent refreshes always fetch fresh data.
    let isFirstLoad = true;
    return new ActiveExecutionImpl(executionId, autoRefreshModel, (executionId: string) => {
      const overview$ = isFirstLoad
        ? this._executionService.getExecutionOverviewCached(executionId)
        : this._executionService.getExecutionOverview(executionId);
      isFirstLoad = false;
      return overview$.pipe(
        catchError((error) => {
          if (!(error instanceof ApiError)) {
            throw error;
          }

          if (error.status === HttpStatusCode.Forbidden || error.status === HttpStatusCode.NotFound) {
            this.autoCloseExecutionInternal$.next(executionId);
          }

          throw error;
        }),
      );
    });
  }
}
