import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AugmentedExecutionsService,
  AugmentedSchedulerService,
  DateRange,
  DateUtilsService,
  Execution,
  ExecutionSummaryDto,
  ExecutiontTaskParameters,
  Plan,
  PrivateViewPluginService,
  ReportNode,
  TableDataSource,
  TableLocalDataSource,
  TimeRange,
} from '@exense/step-core';
import { ScheduleCrossExecutionStateService } from '../../services/schedule-cross-execution-state.service';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  Observable,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DateTime } from 'luxon';
import { AltExecutionStorageService } from '../../services/alt-execution-storage.service';
import { AltExecutionViewAllService } from '../../services/alt-execution-view-all.service';

const rangeKey = (executionId: string) => `${executionId}_range`;

@Component({
  selector: 'step-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
  providers: [
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
    AltExecutionViewAllService,
  ],
})
export class ScheduleOverviewComponent implements OnInit, ScheduleCrossExecutionStateService {
  private _scheduleApi = inject(AugmentedSchedulerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _dateUtils = inject(DateUtilsService);
  private _viewService = inject(PrivateViewPluginService);
  private _executionStorage = inject(AltExecutionStorageService);
  private _viewAllService = inject(AltExecutionViewAllService);
  private _destroyRef = inject(DestroyRef);

  private relativeTime?: number;

  private readonly _isFullRangeSelected$ = new BehaviorSubject<boolean>(false);
  readonly isFullRangeSelected$ = this._isFullRangeSelected$.asObservable();
  readonly dateRangeCtrl = new FormControl<DateRange | null | undefined>(null);

  private _taskData?: ExecutiontTaskParameters;

  protected task = this._taskData;
  protected taskId = this.task?.id;
  protected plan?: Partial<Plan>;
  protected error = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

  readonly executionId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  readonly activeExecutions$ = this.executionId$.pipe(map((id) => this._scheduleApi.getExecutionsByTaskId(id)));

  readonly executions$ = this.activeExecutions$.pipe(switchMap((executionsObservable) => executionsObservable));

  private summaryInProgressInternal$ = new BehaviorSubject(false);

  readonly summaryInProgress$ = this.summaryInProgressInternal$.pipe(distinctUntilChanged());

  protected summary$: Observable<ReportNodeSummary> = this.executions$.pipe(
    tap(() => this.summaryInProgressInternal$.next(true)),
    switchMap((exec) => {
      const views$ = exec.data.map((execution) =>
        this._viewService.getView('statusDistributionForTestcases', execution.id),
      );
      return forkJoin(views$);
    }),
    map((views) => {
      const combinedSummary: ReportNodeSummary = { total: 0 };
      views.forEach((view) => {
        const distribution = (view as ExecutionSummaryDto).distribution;
        Object.values(distribution).forEach((value) => {
          if (value.count > 0) {
            combinedSummary[value.status] = (combinedSummary[value.status] || 0) + value.count;
            combinedSummary.total += value.count;
          }
        });
      });

      return combinedSummary;
    }),
    tap(() => this.summaryInProgressInternal$.next(false)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  ngOnInit(): void {
    this._activatedRoute.url.subscribe((segments) => {
      this.taskId = segments[segments.length - 1].path;
      if (this.taskId) {
        this._scheduleApi.getExecutionTaskById(this.taskId).subscribe({
          next: (task) => {
            this.task = task;
            this.initializeTask();
            this.initializeDateRange();
          },
          error: () => {
            this.error = 'Invalid Task Id or server error.';
          },
        });
      } else {
        this.error = 'Task Id not found in the URL.';
      }
    });
    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([this.executions$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([execution, isIgnoreFilter]) => {
        this.applyDefaultRange(execution.data[0], !isIgnoreFilter);
      });
  }

  private initializeTask(): void {
    if (this.task) {
      if (!this.task.attributes) {
        this.task.attributes = {};
      }
      if (!this.task.executionsParameters) {
        this.task.executionsParameters = {};
      }
      if (!this.task.executionsParameters.customParameters) {
        this.task.executionsParameters.customParameters = {};
      }

      const repository = this.task?.executionsParameters?.repositoryObject;
      if (repository?.repositoryID === 'local') {
        const planId = repository?.repositoryParameters?.['planid'];
        if (planId) {
          const id = planId;
          const name = this.task.executionsParameters.description ?? '';
          this.plan = {
            id,
            attributes: { name },
          };
        }
      } else {
        this.repositoryId = repository?.repositoryID;
        this.repositoryPlanId =
          repository?.repositoryParameters?.['planid'] ?? repository?.repositoryParameters?.['planId'];
      }
    }
  }

  private initializeDateRange(): void {
    this.updateRelativeTime();
    this.selectFullRange();
  }

  readonly dateRange$ = this.dateRangeCtrl.valueChanges.pipe(
    startWith(this.dateRangeCtrl.value),
    map((range) => range ?? undefined),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeRange$ = this.dateRange$.pipe(
    map((dateRange) => this._dateUtils.dateRange2TimeRange(dateRange)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  updateRange(timeRange?: TimeRange | null): void {
    this.dateRangeCtrl.setValue(this._dateUtils.timeRange2DateRange(timeRange));
  }

  updateRelativeTime(time?: number): void {
    if (time !== undefined) {
      console.log(`Relative time updated to: ${time}`);
    }
  }

  selectFullRange(): void {
    this._isFullRangeSelected$.next(true);
  }

  private getDefaultRangeForExecution(execution: Execution, useStorage?: boolean): DateRange {
    let start: DateTime;
    let end: DateTime;

    if (execution.endTime) {
      const storedRange = useStorage ? this._executionStorage.getItem(rangeKey(execution.id!)) : undefined;
      if (storedRange) {
        const parsed = JSON.parse(storedRange) as { start?: number; end?: number };
        start = DateTime.fromMillis(parsed.start ?? execution.startTime!);
        end = DateTime.fromMillis(parsed.end ?? execution.endTime);
      } else {
        start = DateTime.fromMillis(execution.startTime!);
        end = DateTime.fromMillis(execution.endTime);
      }
    } else if (this.relativeTime) {
      end = DateTime.now();
      start = end.set({ millisecond: end.millisecond - this.relativeTime });
    } else {
      start = DateTime.fromMillis(execution.startTime!);
      end = DateTime.now();
    }

    return { start, end };
  }

  private applyDefaultRange(execution: Execution, useStorage = false): void {
    this.dateRangeCtrl.setValue(this.getDefaultRangeForExecution(execution, useStorage));
  }
}
