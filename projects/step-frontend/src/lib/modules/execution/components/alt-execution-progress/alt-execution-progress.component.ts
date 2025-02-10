import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  map,
  of,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  distinctUntilChanged,
  BehaviorSubject,
  skip,
  filter,
} from 'rxjs';
import {
  ArtefactFilter,
  AugmentedControllerService,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  AugmentedPlansService,
  DateUtilsService,
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
} from '@exense/step-core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { FormBuilder } from '@angular/forms';
import {
  AGGREGATED_TREE_TAB_STATE,
  AGGREGATED_TREE_WIDGET_STATE,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { AltExecutionStorageService, ExecutionContext } from '../../services/alt-execution-storage.service';
import { ALT_EXECUTION_REPORT_IN_PROGRESS } from '../../services/alt-execution-report-in-progress.token';
import { AltExecutionViewAllService } from '../../services/alt-execution-view-all.service';
import { ExecutionActionsTooltips } from '../execution-actions/execution-actions.component';
import { KeyValue } from '@angular/common';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { EXECUTION_ID } from '../../services/execution-id.token';
import { SchedulerInvokerService } from '../../services/scheduler-invoker.service';
import { ActiveExecutionContextService } from '../../services/active-execution-context.service';
import { TimeRangePickerSelection, TimeSeriesConfig } from '../../../timeseries/modules/_common';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';

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
  ],
})
export class AltExecutionProgressComponent implements OnInit, OnDestroy, AltExecutionStateService {
  private _urlParamsService = inject(DashboardUrlParamsService);
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
  private _testCasesSelection = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);
  private _executionId = inject(EXECUTION_ID);
  protected readonly _dialogs = inject(AltExecutionDialogsService);
  private _router = inject(Router);

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

  private timeRangeSelection$: BehaviorSubject<TimeRangePickerSelection> =
    new BehaviorSubject<TimeRangePickerSelection>(undefined!);

  readonly timeRangeChange$ = this.timeRangeSelection$.asObservable().pipe(skip(1), shareReplay(1));

  private isTreeInitialized = false;

  private saveContextToStorage(): void {
    const executionId = this._executionId();
    if (!executionId) {
      return;
    }
    // const start = range.start?.toMillis();
    // const end = range.end?.toMillis();
    const context: ExecutionContext = {
      eId: executionId,
      timeRange: this.getTimeRange(),
    };
    this._executionStorage.saveExecutionContext(context);
  }

  // readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>(null);

  // private dateRangeChangeSubscription = this.dateRangeCtrl.valueChanges
  //   .pipe(takeUntilDestroyed())
  //   .subscribe((range) => {
  //     // Ignore synchronization in case of view all mode
  //     if (this._viewAllService.isViewAll) {
  //       return;
  //     }
  //     this.saveRangeToStorage(range);
  //   });

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

  readonly isFullRangeSelected$ = this.timeRangeSelection$.asObservable().pipe(
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

  readonly timeRange$ = this.timeRangeSelection$.pipe(
    filter((s) => !!s),
    map((selection) => selection.absoluteSelection),
  );

  ngOnInit(): void {
    this.timeRangeChange$.subscribe((x) => this.saveContextToStorage());

    this.execution$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((execution) => {
      this.timeRangeOptions[0].absoluteSelection = { from: execution.startTime!, to: execution.endTime || 0 };
    });

    this.setupDateRangeSyncOnExecutionRefresh();
    this.setupTreeRefresh();

    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([this.execution$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([execution, isIgnoreFilter]) => {
        const urlParams = this._urlParamsService.collectUrlParams();
        if (urlParams.timeRange) {
          // url params take priority
          this.updateTimeRangeSelection(urlParams.timeRange);
        } else {
          const existingContext = this._executionStorage.getExecutionContext(execution.id!);
          if (existingContext) {
            this.updateTimeRangeSelection(existingContext.timeRange);
          } else {
            this.applyDefaultRange(execution);
          }
        }
        this._urlParamsService.updateUrlParams(this.getTimeRange());
      });
  }

  ngOnDestroy(): void {
    this.keywordsDataSource.destroy();
    this.testCasesDataSource?.destroy();
  }

  private isNotDefaultRangeSelected = toSignal(
    this.timeRangeSelection$.pipe(map((range) => !!range && range.type !== 'FULL')),
  );

  private setupDateRangeSyncOnExecutionRefresh(): void {
    this.execution$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((execution) => {
      if (this.isNotDefaultRangeSelected()) {
        return;
      }
      this.applyDefaultRange(execution);
    });
  }

  private setupTreeRefresh(): void {
    combineLatest([this.executionId$, this.timeRangeChange$])
      .pipe(
        switchMap(([executionId, timeSelection]) => {
          if (timeSelection.type === 'FULL') {
            return this._executionsApi.getFullAggregatedReportView(executionId);
          }
          return this._executionsApi.getAggregatedReportView(executionId, { range: timeSelection.absoluteSelection! });
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

  relaunchExecution(): void {
    this._router.navigate([{ outlets: { modal: ['launch'] } }], { relativeTo: this._activatedRoute });
  }

  manualRefresh(): void {
    this._activeExecutionContext.manualRefresh();
  }

  private applyDefaultRange(execution: Execution, useStorage = false): void {
    const fullRange = { from: execution.startTime!, to: execution.endTime || 0 };
    const fullRangeOption: TimeRangePickerSelection = { type: 'FULL', absoluteSelection: fullRange };
    this.updateTimeRangeSelection(fullRangeOption);
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

  getTimeRange(): TimeRangePickerSelection {
    return this.timeRangeSelection$.getValue();
  }

  updateTimeRangeSelection(selection: TimeRangePickerSelection): void {
    if (selection.type === 'RELATIVE') {
      let time = selection.relativeSelection!.timeInMs;
      let now = new Date().getTime() - 5000;
      selection!.absoluteSelection = { from: now - time, to: now };
      if (!selection.relativeSelection!.label) {
        let foundRelativeOption = this.timeRangeOptions.find(
          (o) => o.type === 'RELATIVE' && o.relativeSelection!.timeInMs === time,
        );
        selection.relativeSelection!.label = foundRelativeOption?.relativeSelection?.label || `Last ${time} ms`;
      }
    }
    this.timeRangeSelection$.next(selection);
  }
}
