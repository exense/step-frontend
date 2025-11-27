import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  ApiError,
  AugmentedExecutionsService,
  AutoRefreshModel,
  AutoRefreshModelFactoryService,
  Execution,
} from '@exense/step-core';
import { BehaviorSubject, concatMap, filter, Observable, startWith, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpStatusCode } from '@angular/common/http';
import { TimeRangePickerSelection } from '../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';

export interface ActiveExecution {
  readonly executionId: string;
  readonly execution$: Observable<Execution>;
  readonly autoRefreshModel: AutoRefreshModel;
  readonly timeRangeSelectionChange$: Observable<TimeRangePickerSelection>;
  performanceTabSettings: PerformanceTabSettings;

  updateTimeRange(timeRangeSelection: TimeRangePickerSelection): void;
  getTimeRangeSelection(): TimeRangePickerSelection;
  updateChartsResolution(resolution: number): void;
  updateCompareModeEnabled(enabled: boolean): void;
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
    private loadExecution: (eId: string) => Observable<Execution>,
  ) {
    this.setupExecutionRefresh();
  }
  private timeRangeSelectionInternal$ = new BehaviorSubject<TimeRangePickerSelection>({ type: 'FULL' });
  timeRangeSelectionChange$ = this.timeRangeSelectionInternal$.asObservable();
  performanceTabSettings: PerformanceTabSettings = { resolution: 0, compareModeEnabled: false };

  private executionInternal$ = new BehaviorSubject<Execution | undefined>(undefined);

  readonly execution$ = this.executionInternal$.pipe(filter((execution) => !!execution)) as Observable<Execution>;

  updateTimeRange(timeRangeSelection: TimeRangePickerSelection) {
    this.timeRangeSelectionInternal$.next(timeRangeSelection);
  }

  getTimeRangeSelection(): TimeRangePickerSelection {
    return this.timeRangeSelectionInternal$.getValue();
  }

  destroy(): void {
    this.executionInternal$.complete();
    this.autoRefreshModel.destroy();
    this.timeRangeSelectionInternal$.complete();
  }

  private setupExecutionRefresh(): void {
    if (this.executionId === 'open') {
      return;
    }

    this.autoRefreshModel.refresh$
      .pipe(
        startWith(() => undefined),
        concatMap(() => this.loadExecution(this.executionId)),
      )
      .subscribe((execution) => {
        this.executionInternal$.next(execution);
        if (execution.status === 'ENDED') {
          this.autoRefreshModel.setDisabled(true);
          this.autoRefreshModel.setInterval(0);
          this.autoRefreshModel.setAutoIncreaseTo(0);
        }
      });
    this.autoRefreshModel.setDisabled(false);
    this.autoRefreshModel.setInterval(100);
    this.autoRefreshModel.setAutoIncreaseTo(5000);
  }

  manualRefresh(): void {
    this.loadExecution(this.executionId).subscribe((execution) => {
      this.executionInternal$.next(execution);
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
export class ActiveExecutionsService implements OnDestroy {
  private _executionService = inject(AugmentedExecutionsService);
  private _autoRefreshFactory = inject(AutoRefreshModelFactoryService);

  private executions = new Map<string, ActiveExecution>();
  private autoCloseExecutionInternal$ = new Subject<string>();
  readonly autoCloseExecution$ = this.autoCloseExecutionInternal$.asObservable();

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
    this.autoCloseExecutionInternal$.complete();
    this.cleanup();
  }

  cleanup(): boolean {
    this.executions.forEach((activeExecution) => activeExecution.destroy());
    this.executions.clear();
    return true;
  }

  private createActiveExecution(executionId: string): ActiveExecution {
    const autoRefreshModel = this._autoRefreshFactory.create();
    return new ActiveExecutionImpl(executionId, autoRefreshModel, (executionId: string) =>
      this._executionService.getExecutionById(executionId).pipe(
        catchError((error) => {
          if (!(error instanceof ApiError)) {
            throw error;
          }

          if (error.status === HttpStatusCode.Forbidden || error.status === HttpStatusCode.NotFound) {
            this.autoCloseExecutionInternal$.next(executionId);
          }

          throw error;
        }),
      ),
    );
  }
}
