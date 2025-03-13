import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  combineLatest,
  map,
  of,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  tap,
  distinctUntilChanged,
  filter,
  Observable,
  skip,
  take,
  debounceTime,
} from 'rxjs';
import {
  ArtefactFilter,
  AugmentedControllerService,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  AugmentedPlansService,
  AugmentedTimeSeriesService,
  Execution,
  IS_SMALL_SCREEN,
  RegistrationStrategy,
  ReportNode,
  selectionCollectionProvider,
  SelectionCollector,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
  ViewRegistryService,
  PopoverMode,
  IncludeTestcases,
  TimeRange,
  AlertType,
  ExecutionCloseHandleService,
} from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import {
  AGGREGATED_TREE_TAB_STATE,
  AGGREGATED_TREE_WIDGET_STATE,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { ALT_EXECUTION_REPORT_IN_PROGRESS } from '../../services/alt-execution-report-in-progress.token';
import { AltExecutionViewAllService } from '../../services/alt-execution-view-all.service';
import { ExecutionActionsTooltips } from '../execution-actions/execution-actions.component';
import { KeyValue } from '@angular/common';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { EXECUTION_ID } from '../../services/execution-id.token';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';
import { ActiveExecutionContextService } from '../../services/active-execution-context.service';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { TimeSeriesConfig, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { Status } from '../../../_common/step-common.module';
import { AltExecutionCloseHandleService } from '../../services/alt-execution-close-handle.service';

enum UpdateSelection {
  ALL = 'all',
  ONLY_NEW = 'onlyNew',
  NONE = 'none',
}

interface RefreshParams {
  execution?: Execution;
  updateSelection?: UpdateSelection;
}

@Component({
  selector: 'step-alt-execution-progress',
  templateUrl: './alt-execution-progress.component.html',
  styleUrl: './alt-execution-progress.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    DashboardUrlParamsService,
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
    {
      provide: ExecutionCloseHandleService,
      useClass: AltExecutionCloseHandleService,
    },
  ],
})
export class AltExecutionProgressComponent implements OnInit, OnDestroy, AltExecutionStateService {
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _activeExecutionContext = inject(ActiveExecutionContextService);
  private _activeExecutionsService = inject(ActiveExecutionsService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _plansApi = inject(AugmentedPlansService);
  private _controllerService = inject(AugmentedControllerService);
  private _systemService = inject(SystemService);
  private _aggregatedTreeTabState = inject(AGGREGATED_TREE_TAB_STATE);
  private _aggregatedTreeWidgetState = inject(AGGREGATED_TREE_WIDGET_STATE);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private _testCasesSelection = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);
  private _executionId = inject(EXECUTION_ID);
  protected readonly _dialogs = inject(AltExecutionDialogsService);
  private _router = inject(Router);
  protected readonly AlertType = AlertType;

  protected isAnalyticsRoute$ = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null), // Emit an initial value when the component loads
    map(() => this._router.url.includes('/analytics')),
  );

  readonly timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'FULL' },
    ...TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS,
  ];

  protected readonly executionTooltips: ExecutionActionsTooltips = {
    simulate: 'Relaunch execution in simulation mode',
    execute: 'Relaunch execution with same parameters',
    schedule: 'Schedule for cyclical execution',
  };

  protected readonly _executionMessages = inject(ViewRegistryService).getDashlets('execution/messages');

  private isTreeInitialized = false;

  selectFullRange(): void {
    this.updateTimeRangeSelection({ type: 'FULL' });
  }

  readonly executionId$ = this._activeExecutionContext.executionId$.pipe(shareReplay(1), takeUntilDestroyed());

  readonly activeExecution$ = this._activeExecutionContext.activeExecution$.pipe(shareReplay(1), takeUntilDestroyed());

  readonly execution$ = this.activeExecution$.pipe(
    switchMap((active) => active.execution$),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeChangeTriggerOnExecutionChangeSubscription = this.activeExecution$
    .pipe(takeUntilDestroyed(), skip(1)) // skip initialization call.
    .subscribe((activeExecution) => {
      // force trigger time range change
      const timeRangeSelection = activeExecution.getTimeRangeSelection();
      setTimeout(() => {
        this._urlParamsService.updateUrlParams(timeRangeSelection);
        this.updateTimeRangeSelection({ ...timeRangeSelection });
      }, 100);
    });

  readonly timeRangeSelection$ = this.activeExecution$.pipe(
    switchMap((activeExecution) => activeExecution.timeRangeSelectionChange$.pipe(debounceTime(300))),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  protected handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this.updateTimeRangeSelection(selection);
  }

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

  readonly isFullRangeSelected$ = this.timeRangeSelection$.pipe(
    map((selection) => {
      return selection.type === 'FULL';
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

  readonly timeRange$: Observable<TimeRange> = combineLatest([this.execution$, this.timeRangeSelection$]).pipe(
    map(([execution, rangeSelection]) => {
      if (execution.id !== this._executionId()) {
        // when the execution changes, the activeExecution is triggered and the time-range will be updated and retrigger this
        return undefined;
      }
      switch (rangeSelection.type) {
        case 'FULL':
          return { from: execution.startTime!, to: execution.endTime || new Date().getTime() };
        case 'ABSOLUTE':
          return rangeSelection.absoluteSelection!;
        case 'RELATIVE':
          const endTime = execution.endTime || new Date().getTime();
          return { from: endTime - rangeSelection.relativeSelection!.timeInMs, to: endTime };
      }
    }),
    filter((range) => !!range),
  ) as Observable<TimeRange>;

  readonly fullTimeRangeLabel = this.timeRange$.pipe(map((range) => TimeSeriesUtils.formatRange(range)));

  ngOnInit(): void {
    const urlParams = this._urlParamsService.collectUrlParams();

    // this component is responsible for triggering the initial timeRange (it can be either the existing one in state or the url one)
    if (urlParams.timeRange) {
      this.updateTimeRangeSelection(urlParams.timeRange);
    } else {
      // force event
      let activeExecution = this._activeExecutionsService.getActiveExecution(this._executionId());
      this.updateTimeRangeSelection({ ...activeExecution.getTimeRangeSelection() });
    }

    this.setupTreeRefresh();
    this.setupErrorsRefresh();
  }

  ngOnDestroy(): void {
    this.keywordsDataSource.destroy();
    this.testCasesDataSource?.destroy();
    this.errorsDataSource.destroy();
  }

  private setupTreeRefresh(): void {
    combineLatest([this.execution$, this.timeRangeSelection$])
      .pipe(
        switchMap(([execution, timeSelection]) => {
          if (timeSelection.type === 'FULL') {
            return this._executionsApi.getFullAggregatedReportView(execution.id!);
          }
          return this._executionsApi.getAggregatedReportView(execution.id!, {
            range: timeSelection.absoluteSelection!,
          });
        }),
        map((response) => response ?? {}),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(({ aggregatedReportView, resolvedPartialPath }) => {
        if (!aggregatedReportView) {
          this.isTreeInitialized = false;
          return;
        }
        // expand all items in tree, due first initialization
        const expandAllByDefault = !this.isTreeInitialized;
        this._aggregatedTreeTabState.init(aggregatedReportView, { resolvedPartialPath, expandAllByDefault });
        this._aggregatedTreeWidgetState.init(aggregatedReportView, { resolvedPartialPath, expandAllByDefault });
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

  relaunchExecution(): void {
    this._router.navigate([{ outlets: { modal: ['launch'] } }], { relativeTo: this._activatedRoute });
  }

  manualRefresh(): void {
    this._activeExecutionContext.manualRefresh();
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

  updateTimeRangeSelection(selection: TimeRangePickerSelection): void {
    this.execution$.pipe(take(1)).subscribe((execution) => {
      if (selection.type === 'RELATIVE') {
        let time = selection.relativeSelection!.timeInMs;
        let now = new Date().getTime();
        let end = execution.endTime || now - 5000;
        let from = end - time;
        if (from > end) {
          // remove the 5 sec buffer
          end = now;
        }
        selection!.absoluteSelection = { from: from, to: end };
        if (!selection.relativeSelection!.label) {
          let foundRelativeOption = this.timeRangeOptions.find(
            (o) => o.type === 'RELATIVE' && o.relativeSelection!.timeInMs === time,
          );
          selection.relativeSelection!.label = foundRelativeOption?.relativeSelection?.label || `Last ${time} ms`;
        }
      }
      this._activeExecutionsService.getActiveExecution(this._executionId()).updateTimeRange(selection);
    });
  }
}
