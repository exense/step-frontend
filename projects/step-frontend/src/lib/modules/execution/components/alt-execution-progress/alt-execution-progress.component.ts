import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  ArtefactFilter,
  AugmentedControllerService,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  AugmentedPlansService,
  AugmentedTimeSeriesService,
  DateRange,
  DateUtilsService,
  DEFAULT_RELATIVE_TIME_OPTIONS,
  Execution,
  IS_SMALL_SCREEN,
  RegistrationStrategy,
  RELATIVE_TIME_OPTIONS,
  ReportNode,
  selectionCollectionProvider,
  SelectionCollector,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
  TimeOption,
  TimeRange,
  ViewRegistryService,
  PopoverMode,
  IncludeTestcases,
} from '@exense/step-core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { FormBuilder } from '@angular/forms';
import { DateTime } from 'luxon';
import {
  AGGREGATED_TREE_TAB_STATE,
  AGGREGATED_TREE_WIDGET_STATE,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { AltExecutionStorageService } from '../../services/alt-execution-storage.service';
import { ALT_EXECUTION_REPORT_IN_PROGRESS } from '../../services/alt-execution-report-in-progress.token';
import { AltExecutionViewAllService } from '../../services/alt-execution-view-all.service';
import { ExecutionActionsTooltips } from '../execution-actions/execution-actions.component';
import { KeyValue } from '@angular/common';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { EXECUTION_ID } from '../../services/execution-id.token';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';
import { ActiveExecutionContextService } from '../../services/active-execution-context.service';
import { Status } from '../../../_common/step-common.module';

const rangeKey = (executionId: string) => `${executionId}_range`;

enum UpdateSelection {
  ALL = 'all',
  ONLY_NEW = 'onlyNew',
  NONE = 'none',
}

interface RefreshParams {
  execution?: Execution;
  updateSelection?: UpdateSelection;
}

const COMPARE_MEASUREMENT_ERROR_MS = 30_000;

interface DateRangeExt extends DateRange {
  isDefault?: boolean;
  relativeTime?: number;
}

@Component({
  selector: 'step-alt-execution-progress',
  templateUrl: './alt-execution-progress.component.html',
  styleUrl: './alt-execution-progress.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    AltExecutionTabsService,
    {
      provide: EXECUTION_ID,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return () => _activatedRoute.snapshot.params?.['id'] ?? '';
      },
    },
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
    ...selectionCollectionProvider(
      {
        selectionKeyProperty: 'artefactID',
        registrationStrategy: RegistrationStrategy.MANUAL,
      },
      AutoDeselectStrategy.KEEP_SELECTION,
    ),
    AltExecutionDialogsService,
    {
      provide: SchedulerInvokerService,
      useExisting: AltExecutionDialogsService,
    },
  ],
})
export class AltExecutionProgressComponent implements OnInit, OnDestroy, AltExecutionStateService {
  private _activeExecutionContext = inject(ActiveExecutionContextService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _plansApi = inject(AugmentedPlansService);
  private _controllerService = inject(AugmentedControllerService);
  private _systemService = inject(SystemService);
  private _fb = inject(FormBuilder);
  private _aggregatedTreeTabState = inject(AGGREGATED_TREE_TAB_STATE);
  private _aggregatedTreeWidgetState = inject(AGGREGATED_TREE_WIDGET_STATE);
  private _dateUtils = inject(DateUtilsService);
  private _executionStorage = inject(AltExecutionStorageService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  private _viewAllService = inject(AltExecutionViewAllService);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private _testCasesSelection = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);
  private _executionId = inject(EXECUTION_ID);
  protected readonly _dialogs = inject(AltExecutionDialogsService);
  private _router = inject(Router);

  protected readonly executionTooltips: ExecutionActionsTooltips = {
    simulate: 'Relaunch execution in simulation mode',
    execute: 'Relaunch execution with same parameters',
    schedule: 'Schedule for cyclical execution',
  };

  protected readonly _executionMessages = inject(ViewRegistryService).getDashlets('execution/messages');

  private isTreeInitialized = false;

  private relativeTime = signal<number | undefined>(undefined);

  updateRelativeTime(time?: number) {
    this.relativeTime.set(time);
  }

  readonly dateRangeCtrl = this._fb.control<DateRangeExt | null | undefined>(null);

  readonly dateRange$ = combineLatest([
    this.dateRangeCtrl.valueChanges.pipe(startWith(this.dateRangeCtrl.value)),
    toObservable(this.relativeTime),
  ]).pipe(
    map(([range, relativeTime]) => {
      if (!range) {
        return undefined;
      }
      return {
        ...range,
        isDefault: range.isDefault || !!relativeTime,
        relativeTime,
      } as DateRangeExt;
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private isNotDefaultRangeSelected = toSignal(this.dateRange$.pipe(map((range) => !!range && !range.isDefault)));

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

  readonly executionId$ = this._activeExecutionContext.executionId$;
  readonly activeExecution$ = this._activeExecutionContext.activeExecution$;
  readonly execution$ = this._activeExecutionContext.execution$;

  readonly executionPlan$ = this.execution$.pipe(
    map((execution) => execution.planId),
    switchMap((planId) => (!planId ? of(undefined) : this._plansApi.getPlanByIdCached(planId))),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly resolvedParameters$ = this.execution$.pipe(
    map((execution) => {
      return execution.parameters as unknown as Array<KeyValue<string, string>> | undefined;
    }),
  );
  protected isResolvedParametersVisible = signal(false);

  readonly displayStatus$ = this.execution$.pipe(
    map((execution) => (execution?.status === 'ENDED' ? execution?.result : execution?.status)),
  );

  readonly executionFulLRange$ = this.execution$.pipe(map((execution) => this.getDefaultRangeForExecution(execution)));

  readonly isFullRangeSelected$ = combineLatest([this.dateRange$, this.executionFulLRange$]).pipe(
    map(([selectedRange, fullRange]) => {
      const startEq = this._dateUtils.areDatesEqual(selectedRange?.start, fullRange?.start);
      const endEq = this._dateUtils.areDatesEqual(selectedRange?.end, fullRange?.end, COMPARE_MEASUREMENT_ERROR_MS);
      return startEq && endEq;
    }),
  );

  readonly isExecutionCompleted$ = this.execution$.pipe(map((execution) => execution.status === 'ENDED'));

  readonly hasTestCasesFilter$ = this._testCasesSelection.selected$.pipe(
    map((selected) => selected.length > 0 && selected.length < this._testCasesSelection.possibleLength),
  );

  private previousTestCasesIds: string[] = [];
  readonly testCases$ = this.execution$.pipe(
    startWith(undefined),
    pairwise(),
    map(([prevExecution, currentExecution]) => {
      const updateSelection =
        prevExecution?.id !== currentExecution?.id ? UpdateSelection.ALL : UpdateSelection.ONLY_NEW;
      return { execution: currentExecution, updateSelection } as RefreshParams;
    }),
    switchMap(({ execution, updateSelection }) => {
      if (!execution?.id) {
        return of([]);
      }
      return this._executionsApi
        .getReportNodesByExecutionId(execution.id, 'step.artefacts.reports.TestCaseReportNode', 500)
        .pipe(
          tap((reportNodes) => {
            const oldTestCasesIds = new Set(this.previousTestCasesIds);
            const newTestCases = reportNodes.filter((testCase) => !oldTestCasesIds.has(testCase.id!));
            this.previousTestCasesIds = reportNodes.map((testCase) => testCase.id!);
            this._testCasesSelection.registerPossibleSelectionManually(reportNodes);
            if (updateSelection !== UpdateSelection.NONE) {
              this.determineDefaultSelection(
                updateSelection === UpdateSelection.ONLY_NEW ? newTestCases : reportNodes,
                execution.executionParameters?.artefactFilter,
              );
            }
          }),
        );
    }),
    map((testCases) => (!testCases?.length ? undefined : testCases)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  protected testCasesForRelaunch$ = this.testCases$.pipe(
    map((testCases) => {
      const list = testCases?.filter((item) => !!item && item?.status !== 'SKIPPED')?.map((item) => item?.artefactID!);
      if (list?.length === testCases?.length) {
        return undefined;
      }
      return list;
    }),
    map((list) => {
      if (!list?.length) {
        return undefined;
      }
      return {
        list,
        by: 'id',
      } as IncludeTestcases;
    }),
  );

  private testCasesDataSource?: TableDataSource<ReportNode>;
  readonly testCasesDataSource$ = this.testCases$.pipe(
    tap(() => this.testCasesDataSource?.destroy()),
    map((nodes) => this.createReportNodesDatasource(nodes ?? []).sharable()),
    tap((dataSource) => (this.testCasesDataSource = dataSource)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly keywordParameters$ = combineLatest([this.execution$, this._testCasesSelection.selected$]).pipe(
    map(([execution, testCasesSelection]) => {
      return {
        type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS,
        eid: execution.id,
        testcases: !testCasesSelection.length ? undefined : testCasesSelection,
      } as KeywordParameters;
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private keywordsDataSource = (this._controllerService.createDataSource() as TableDataSource<ReportNode>).sharable();
  readonly keywordsDataSource$ = of(this.keywordsDataSource);

  private errorsDataSource = this._timeSeriesService.createErrorsDataSource().sharable();
  readonly errorsDataSource$ = of(this.errorsDataSource);
  readonly availableErrorTypes$ = this.errorsDataSource.allData$.pipe(
    map((items) => items.reduce((res, item) => [...res, ...item.types], [] as string[])),
    map((errorTypes) => Array.from(new Set(errorTypes)) as Status[]),
    shareReplay(1),
    takeUntilDestroyed(),
  );

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
    this.setupRangeSyncWithStorage();
    this.setupDateRangeSyncOnExecutionRefresh();
    this.setupTreeRefresh();
    this.setupErrorsRefresh();
  }

  ngOnDestroy(): void {
    this.keywordsDataSource.destroy();
    this.testCasesDataSource?.destroy();
    this.errorsDataSource.destroy();
  }

  private setupRangeSyncWithStorage(): void {
    this.dateRangeCtrl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((range) => {
      // Ignore synchronization in case of view all mode
      if (this._viewAllService.isViewAll) {
        return;
      }
      const executionId = this._executionId();
      if (!range || !executionId) {
        return;
      }
      const start = range.start?.toMillis();
      const end = range.end?.toMillis();
      this._executionStorage.setItem(rangeKey(executionId), JSON.stringify({ start, end }));
    });
  }

  private setupDateRangeSyncOnExecutionRefresh(): void {
    this.execution$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((execution) => {
      if (this.isNotDefaultRangeSelected()) {
        return;
      }
      this.applyDefaultRange(execution);
    });
  }

  private setupTreeRefresh(): void {
    const range$ = this.dateRange$.pipe(map((range) => (!range?.relativeTime && range?.isDefault ? undefined : range)));

    combineLatest([this.executionId$, range$])
      .pipe(
        switchMap(([executionId, range]) => {
          if (!range) {
            return this._executionsApi.getFullAggregatedReportView(executionId);
          }
          const from = range.start?.toMillis();
          const to = range.end?.toMillis();
          return this._executionsApi.getAggregatedReportView(executionId, { range: { from, to } });
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((root) => {
        if (!root) {
          this.isTreeInitialized = false;
        }
        this._aggregatedTreeTabState.init(root);
        this._aggregatedTreeWidgetState.init(root);
        this.isTreeInitialized = true;
      });
  }

  private setupErrorsRefresh(): void {
    combineLatest([this.execution$, this.timeRange$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([execution, timeRange]) => {
        const executionId = execution.id!;
        this.errorsDataSource.reload({ request: { executionId, timeRange } });
      });
  }

  private getDefaultRangeForExecution(execution: Execution, useStorage?: boolean): DateRangeExt {
    let start: DateTime;
    let end: DateTime;
    const relativeTime = this.relativeTime();

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
    } else if (relativeTime) {
      end = DateTime.now();
      start = end.set({ millisecond: end.millisecond - relativeTime });
    } else {
      start = DateTime.fromMillis(execution.startTime!);
      end = DateTime.now();
    }

    return { start, end, isDefault: true };
  }

  relaunchExecution(): void {
    this._router.navigate([{ outlets: { modal: ['launch'] } }], { relativeTo: this._activatedRoute });
  }

  manualRefresh(): void {
    this._activeExecutionContext.manualRefresh();
  }

  private applyDefaultRange(execution: Execution, useStorage = false): void {
    const defaultRange = this.getDefaultRangeForExecution(execution, useStorage);
    this.dateRangeCtrl.setValue(defaultRange);
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

  private determineDefaultSelection(testCases: ReportNode[], artefactFilter?: ArtefactFilter): void {
    const selectedTestCases = testCases.filter((value) => {
      if (!artefactFilter) {
        return true;
      }
      switch (artefactFilter.class) {
        case 'step.artefacts.filters.TestCaseFilter':
          return (artefactFilter as any).includedNames.includes(value.name);
        case `step.artefacts.filters.TestCaseIdFilter`:
          return (artefactFilter as any).includedIds.includes(value.artefactID);
        default:
          return true;
      }
    });
    this._testCasesSelection.select(...selectedTestCases);
  }

  protected readonly PopoverMode = PopoverMode;
}
