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
import { BehaviorSubject, concatMap, EMPTY, filter, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
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
    private loadOverview: (eId: string) => Observable<LoadedExecutionOverview>,
  ) {}

  private isDestroyed = false;
  private readonly terminator$ = new Subject<void>();
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
    if (this.isDestroyed) {
      return;
    }
    this.isDestroyed = true;
    this.terminator$.next();
    this.terminator$.complete();
    this.executionInternal$.complete();
    this.noticesInternal$.complete();
    this.autoRefreshModel.setDisabled(true);
    this.autoRefreshModel.destroy();
    this.timeRangeSelectionInternal$.complete();
  }

  start(): void {
    if (this.isDestroyed || this.executionId === 'open') {
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
        takeUntil(this.terminator$),
      )
      .subscribe((overview) => {
        const execution = overview.execution;
        this.executionInternal$.next(execution);
        this.noticesInternal$.next(overview.resolvedNotices ?? []);
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
    if (this.isDestroyed || this.autoRefreshModel.disabled) {
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
    if (this.isDestroyed) {
      return;
    }
    this.loadOverview(this.executionId)
      .pipe(takeUntil(this.terminator$))
      .subscribe((overview) => {
        this.executionInternal$.next(overview.execution);
        this.noticesInternal$.next(overview.resolvedNotices ?? []);
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
    const existing = this.executions.get(executionId);
    if (existing) {
      return existing;
    }
    const execution = this.createActiveExecution(executionId);
    this.executions.set(executionId, execution);
    execution.start();
    return execution;
  }

  removeActiveExecution(executionId: string): void {
    if (!this.executions.has(executionId)) {
      return;
    }
    const execution = this.executions.get(executionId)!;
    this.executions.delete(executionId);
    execution.destroy();
    this._executionService.cleanupCache(executionId);
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
    this._executionService.cleanupCache();
    return true;
  }

  reload(isCausedByProjectChange?: boolean): void {
    if (!isCausedByProjectChange) {
      return;
    }
    this.cleanup();
  }

  private createActiveExecution(executionId: string): ActiveExecutionImpl {
    const autoRefreshModel = this._autoRefreshFactory.create();
    // The first load reuses the overview already fetched by the route guards (cached), so opening an
    // execution issues a single /overview request. Subsequent refreshes always fetch fresh data.
    let isFirstLoad = true;
    const activeExecution = new ActiveExecutionImpl(executionId, autoRefreshModel, (executionId: string) => {
      const overview$ = isFirstLoad
        ? this._executionService.getExecutionOverviewCached(executionId)
        : this._executionService.getExecutionOverview(executionId);
      isFirstLoad = false;
      return overview$.pipe(
        filter((overview): overview is LoadedExecutionOverview => {
          if (!overview.execution) {
            this.closeInvalidExecution(executionId, activeExecution);
            return false;
          }
          return true;
        }),
        catchError((error) => {
          if (
            error instanceof ApiError &&
            (error.status === HttpStatusCode.Forbidden || error.status === HttpStatusCode.NotFound)
          ) {
            this.closeInvalidExecution(executionId, activeExecution);
          }
          return EMPTY;
        }),
      );
    });
    return activeExecution;
  }

  private closeInvalidExecution(executionId: string, activeExecution: ActiveExecution): void {
    if (this.executions.get(executionId) !== activeExecution) {
      return;
    }
    this.removeActiveExecution(executionId);
    this.autoCloseExecutionInternal$.next(executionId);
  }
}
