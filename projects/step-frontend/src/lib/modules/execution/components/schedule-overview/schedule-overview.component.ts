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
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { FormBuilder, FormControl } from '@angular/forms';
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
  private _fb = inject(FormBuilder);

  private relativeTime?: number;

  private readonly _isFullRangeSelected$ = new BehaviorSubject<boolean>(false);
  readonly isFullRangeSelected$ = this._isFullRangeSelected$.asObservable();
  readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>(null);

  protected plan?: Partial<Plan>;
  protected error = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

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

  readonly taskId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  readonly activeTask$ = this.taskId$.pipe(
    switchMap((id) => {
      return this._scheduleApi.getExecutionTaskById(id);
    }),
  );

  readonly task$ = this.activeTask$.pipe(
    map((task) => {
      if (!task) {
        return null;
      }

      task.attributes = task.attributes || {};
      task.executionsParameters = task.executionsParameters || {};
      task.executionsParameters.customParameters = task.executionsParameters.customParameters || {};

      const repository = task.executionsParameters.repositoryObject;

      if (repository?.repositoryID === 'local') {
        const planId = repository.repositoryParameters?.['planid'];
        if (planId) {
          const name = task.executionsParameters.description ?? '';
          this.plan = {
            id: planId,
            attributes: { name },
          };
        }
      } else {
        this.repositoryId = repository?.repositoryID;
        this.repositoryPlanId =
          repository?.repositoryParameters?.['planid'] ?? repository?.repositoryParameters?.['planId'];
      }

      return task;
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  //   readonly executions$ = this.taskId$.pipe(
  //     switchMap((id) => {
  //       const dateRange = this.dateRangeCtrl.value;
  //       if (dateRange && dateRange.start && dateRange.end) {
  //         return this._scheduleApi.getExecutionsByTaskId(id, dateRange.start.millisecond, dateRange.end.millisecond);
  //       } else {
  //         return this._scheduleApi.getExecutionsByTaskId(id);
  //       }
  //     }),
  //     shareReplay(1),
  //     takeUntilDestroyed(),
  //   );
  readonly executions$ = combineLatest([
    this.taskId$,
    this.dateRangeCtrl.valueChanges.pipe(startWith(this.dateRangeCtrl.value)),
  ]).pipe(
    switchMap(([id, dateRange]) =>
      this._scheduleApi.getExecutionsByTaskId(id).pipe(
        map((executions) => {
          if (dateRange?.start && dateRange?.end) {
            const start = dateRange.start.toMillis();
            const end = dateRange.end.toMillis();

            return {
              ...executions,
              data: executions.data.filter((execution) => execution.startTime >= start && execution.endTime <= end),
            };
          } else {
            return executions;
          }
        }),
      ),
    ),
    shareReplay(1),
    takeUntilDestroyed(),
  );

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
    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([this.executions$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([execution, isIgnoreFilter]) => {
        this.applyDefaultRange(execution.data[0], !isIgnoreFilter);
      });
  }

  updateRange(timeRange?: TimeRange | null): void {
    this.dateRangeCtrl.setValue(this._dateUtils.timeRange2DateRange(timeRange));
  }

  updateRelativeTime(time?: number): void {
    this.relativeTime = time;
  }

  selectFullRange(): void {
    this._isFullRangeSelected$.next(true);
  }

  private getDefaultRangeForExecution(execution: Execution, useStorage?: boolean): DateRange {
    let start: DateTime;
    let end: DateTime;

    start = DateTime.fromMillis(execution.startTime!);
    end = DateTime.now();

    return { start, end };
  }

  private applyDefaultRange(execution: Execution, useStorage = false): void {
    this.dateRangeCtrl.setValue(this.getDefaultRangeForExecution(execution, useStorage));
  }
}
