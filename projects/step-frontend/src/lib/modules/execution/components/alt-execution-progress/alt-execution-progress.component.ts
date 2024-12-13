import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import {
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  combineLatest,
  startWith,
  take,
  tap,
  distinctUntilChanged,
} from 'rxjs';
import {
  AugmentedControllerService,
  AugmentedExecutionsService,
  DateRange,
  DateUtilsService,
  DEFAULT_RELATIVE_TIME_OPTIONS,
  Execution,
  ExecutiontTaskParameters,
  IS_SMALL_SCREEN,
  RELATIVE_TIME_OPTIONS,
  ReportNode,
  ScheduledTaskTemporaryStorageService,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
  TimeOption,
  TimeRange,
  TreeNodeUtilsService,
  TreeStateService,
  ViewRegistryService,
} from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { FormBuilder } from '@angular/forms';
import { DateTime } from 'luxon';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedReportViewTreeNodeUtilsService } from '../../services/aggregated-report-view-tree-node-utils.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { AltExecutionStorageService } from '../../services/alt-execution-storage.service';
import { ALT_EXECUTION_REPORT_IN_PROGRESS } from '../../services/alt-execution-report-in-progress.token';
import { AltExecutionViewAllService } from '../../services/alt-execution-view-all.service';

const rangeKey = (executionId: string) => `${executionId}_range`;

@Component({
  selector: 'step-alt-execution-progress',
  templateUrl: './alt-execution-progress.component.html',
  styleUrl: './alt-execution-progress.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    AltExecutionTabsService,
    {
      provide: AltExecutionStateService,
      useExisting: AltExecutionProgressComponent,
    },
    {
      provide: RELATIVE_TIME_OPTIONS,
      useFactory: () => {
        const _state = inject(AltExecutionStateService);
        const _defaultOptions = inject(DEFAULT_RELATIVE_TIME_OPTIONS);

        return _state.executionFulLRange$.pipe(
          map((value) => ({ value, label: 'Full Range' }) as TimeOption),
          map((fullRangeOption) => [..._defaultOptions, fullRangeOption]),
        );
      },
    },
    AggregatedReportViewTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: AggregatedReportViewTreeNodeUtilsService,
    },
    AggregatedReportViewTreeStateService,
    {
      provide: TreeStateService,
      useExisting: AggregatedReportViewTreeStateService,
    },
    AltExecutionViewAllService,
    AltKeywordNodesStateService,
    AltTestCasesNodesStateService,
    {
      provide: ALT_EXECUTION_REPORT_IN_PROGRESS,
      useFactory: () => {
        const _keywords = inject(AltKeywordNodesStateService);
        const _testcases = inject(AltTestCasesNodesStateService);
        return combineLatest([
          _keywords.summaryInProgress$,
          _keywords.listInProgress$,
          _testcases.summaryInProgress$,
          _testcases.listInProgress$,
        ]).pipe(
          map((inProgressFlags) => inProgressFlags.reduce((res, inProgress) => res || inProgress, false)),
          distinctUntilChanged(),
          shareReplay(1),
        );
      },
    },
    AltExecutionReportPrintService,
  ],
})
export class AltExecutionProgressComponent implements OnInit, OnDestroy, AltExecutionStateService {
  private _activeExecutions = inject(ActiveExecutionsService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _router = inject(Router);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _controllerService = inject(AugmentedControllerService);
  private _systemService = inject(SystemService);
  private _fb = inject(FormBuilder);
  private _aggregatedTreeState = inject(AggregatedReportViewTreeStateService);
  private _dateUtils = inject(DateUtilsService);
  private _executionStorage = inject(AltExecutionStorageService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  private _viewAllService = inject(AltExecutionViewAllService);

  protected readonly _executionMessages = inject(ViewRegistryService).getDashlets('execution/messages');

  private isTreeInitialized = false;

  private relativeTime?: number;

  get executionIdSnapshot(): string {
    const routeSnapshot = this._activatedRoute.snapshot;
    return routeSnapshot.params?.['id'] ?? '';
  }

  updateRelativeTime(time?: number) {
    this.relativeTime = time;
  }

  readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>(null);

  private dateRangeChangeSubscription = this.dateRangeCtrl.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe((range) => {
      // Ignore synchronization in case of view all mode
      if (this._viewAllService.isViewAll) {
        return;
      }
      this.saveRangeToStorage(range);
    });

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

  updateRange(timeRange?: TimeRange | null) {
    this.dateRangeCtrl.setValue(this._dateUtils.timeRange2DateRange(timeRange));
  }

  selectFullRange(): void {
    this.execution$.pipe(take(1)).subscribe((execution) => {
      this.applyDefaultRange(execution);
    });
  }

  readonly executionId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  readonly activeExecution$ = this.executionId$.pipe(map((id) => this._activeExecutions.getActiveExecution(id)));

  readonly execution$ = this.activeExecution$.pipe(
    switchMap((activeExecution) => activeExecution?.execution$ ?? of(undefined)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly displayStatus$ = this.execution$.pipe(
    map((execution) => (execution?.status === 'ENDED' ? execution?.result : execution?.status)),
  );

  readonly executionFulLRange$ = this.execution$.pipe(map((execution) => this.getDefaultRangeForExecution(execution)));

  readonly isFullRangeSelected$ = combineLatest([this.dateRange$, this.executionFulLRange$]).pipe(
    map(([selectedRange, fullRange]) => {
      const startEq = this._dateUtils.areDatesEqual(selectedRange?.start, fullRange?.start);
      const endEq = this._dateUtils.areDatesEqual(selectedRange?.end, fullRange?.end);
      return startEq && endEq;
    }),
  );

  readonly isExecutionCompleted$ = this.execution$.pipe(map((execution) => execution.status === 'ENDED'));

  readonly testCases$ = this.execution$.pipe(
    switchMap((execution) =>
      this._executionsApi.getReportNodesByExecutionId(execution.id!, 'step.artefacts.reports.TestCaseReportNode', 500),
    ),
    map((testCases) => (!testCases?.length ? undefined : testCases)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private testCasesDataSource?: TableDataSource<ReportNode>;
  readonly testCasesDataSource$ = this.testCases$.pipe(
    tap(() => this.testCasesDataSource?.destroy()),
    map((nodes) => this.createReportNodesDatasource(nodes ?? []).sharable()),
    tap((dataSource) => (this.testCasesDataSource = dataSource)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly keywordParameters$ = combineLatest([this.execution$, this.testCases$]).pipe(
    map(([execution, testCases]) => {
      return {
        type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS,
        eid: execution.id,
        testcases: !testCases?.length ? undefined : testCases.map((testCase) => testCase.artefactID!),
      } as KeywordParameters;
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private keywordsDataSource = (this._controllerService.createDataSource() as TableDataSource<ReportNode>).sharable();
  readonly keywordsDataSource$ = of(this.keywordsDataSource);

  readonly currentOperations$ = this.execution$.pipe(
    map((execution) => {
      if (!execution || execution.status === 'ENDED') {
        return undefined;
      }
      return execution.id;
    }),
    switchMap((eId) => {
      if (!eId) {
        return of(undefined);
      }
      return this._systemService.getCurrentOperations(eId);
    }),
  );

  ngOnInit(): void {
    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([this.execution$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([execution, isIgnoreFilter]) => {
        this.refreshExecutionTree(execution);
        this.applyDefaultRange(execution, !isIgnoreFilter);
      });
  }

  ngOnDestroy(): void {
    this.keywordsDataSource.destroy();
    this.testCasesDataSource?.destroy();
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

  private saveRangeToStorage(range?: DateRange | null): void {
    const executionId = this.executionIdSnapshot;
    if (!range || !executionId) {
      return;
    }
    const start = range.start?.toMillis();
    const end = range.end?.toMillis();
    this._executionStorage.setItem(rangeKey(executionId), JSON.stringify({ start, end }));
  }

  handleTaskSchedule(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], { relativeTo: this._activatedRoute });
  }

  manualRefresh(): void {
    const executionId = this._activatedRoute.snapshot.params['id'];
    this._activeExecutions.getActiveExecution(executionId)?.manualRefresh();
  }

  private applyDefaultRange(execution: Execution, useStorage = false): void {
    this.dateRangeCtrl.setValue(this.getDefaultRangeForExecution(execution, useStorage));
  }

  private refreshExecutionTree(execution: Execution): void {
    this._aggregatedTreeState
      .loadTree(execution.id!)
      .subscribe((isInitialized) => (this.isTreeInitialized = isInitialized));
  }

  private createReportNodesDatasource(nodes: ReportNode[]): TableDataSource<ReportNode> {
    return new TableLocalDataSource(
      nodes,
      TableLocalDataSource.configBuilder<ReportNode>()
        .addSearchStringPredicate('name', (item) => item.name)
        .addSearchStringRegexPredicate('status', (item) => item.status)
        .addCustomSearchPredicate('executionTime', (item, searchValue) => {
          const [from, to] = searchValue.split('|').map((item) => parseFloat(item));
          if (!from || !to || isNaN(from) || isNaN(to)) {
            return true;
          }
          return !!item.executionTime && item.executionTime >= from && item.executionTime <= to;
        })
        .build(),
    );
  }
}
