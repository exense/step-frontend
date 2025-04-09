import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  skip,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  AggregatedReportView,
  AlertType,
  AugmentedControllerService,
  AugmentedExecutionsService,
  AugmentedPlansService,
  AugmentedTimeSeriesService,
  Execution,
  ExecutionCloseHandleService,
  IncludeTestcases,
  IS_SMALL_SCREEN,
  PopoverMode,
  ReportNode,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
  TimeRange,
  ViewRegistryService,
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
import { AggregatedReportViewExt } from '../../shared/aggregated-report-view-ext';

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
  private _executionId = inject(EXECUTION_ID);
  protected readonly _dialogs = inject(AltExecutionDialogsService);
  private _router = inject(Router);
  protected readonly AlertType = AlertType;

  protected isAnalyticsRoute$ = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null), // Emit an initial value when the component loads
    map(() => this._router.url.includes('/analytics')),
    shareReplay(1),
  );

  readonly timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'FULL' },
    ...TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS,
  ];

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

  // readonly updateFullTimeRangeSelection = this.execution$.subscribe(execution => {
  //   console.log('execution change', execution);
  //   this.timeRangeOptions[0] = {type: 'FULL', absoluteSelection: {from: execution.startTime!, to: execution.endTime!}};
  // });

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
    switchMap((activeExecution) => activeExecution.timeRangeSelectionChange$.pipe(debounceTime(200))),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly updateUrl = this.timeRangeSelection$.pipe(takeUntilDestroyed()).subscribe((range) => {
    this.isAnalyticsRoute$.pipe(take(1)).subscribe((isAnalyticsRoute) => {
      if (!isAnalyticsRoute) {
        this._urlParamsService.updateUrlParams(range);
      }
    });
  });

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

  readonly timeRange$: Observable<TimeRange> = combineLatest([this.execution$, this.timeRangeSelection$]).pipe(
    map(([execution, rangeSelection]) => {
      if (execution.id !== this._executionId()) {
        // when the execution changes, the activeExecution is triggered and the time-range will be updated and retrigger this
        return undefined;
      }
      switch (rangeSelection.type) {
        case 'FULL':
          const now = new Date().getTime();
          return { from: execution.startTime!, to: execution.endTime || Math.max(now, execution.startTime! + 5000) };
        case 'ABSOLUTE':
          return rangeSelection.absoluteSelection!;
        case 'RELATIVE':
          const endTime = execution.endTime || new Date().getTime();
          return { from: endTime - rangeSelection.relativeSelection!.timeInMs, to: endTime };
      }
    }),
    filter((range): range is TimeRange => range !== undefined),
    shareReplay(1),
  ) as Observable<TimeRange>;

  readonly fullTimeRangeLabel = this.timeRange$.pipe(map((range) => TimeSeriesUtils.formatRange(range)));

  readonly isExecutionCompleted$ = this.execution$.pipe(map((execution) => execution.status === 'ENDED'));

  private testCasesRaw$ = this.execution$.pipe(
    startWith(undefined),
    switchMap((execution) => {
      if (!execution?.id) {
        return of([]);
      }
      return this._executionsApi.getReportNodesByExecutionId(
        execution.id,
        'step.artefacts.reports.TestCaseReportNode',
        500,
      );
    }),
    map((testCases) => (!testCases?.length ? undefined : testCases)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly testCases$ = combineLatest([this.testCasesRaw$, this.timeRange$]).pipe(
    map(([testCases, { from, to }]) => {
      if (!testCases) {
        return undefined;
      }
      return testCases.filter((item) => !!item.executionTime && item.executionTime >= from && item.executionTime <= to);
    }),
    map((testCases) => (testCases ? this.aggregateReportNodes(testCases) : undefined)),
  );

  protected testCasesForRelaunch$ = this.testCasesRaw$.pipe(
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

  private testCasesDataSource?: TableDataSource<AggregatedReportView>;
  readonly testCasesDataSource$ = this.testCases$.pipe(
    tap(() => this.testCasesDataSource?.destroy()),
    map((nodes) => this.createAggregatedReportViewDatasource(nodes ?? []).sharable()),
    tap((dataSource) => (this.testCasesDataSource = dataSource)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly keywordParameters$ = this.execution$.pipe(
    map((execution) => {
      return {
        type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS,
        eid: execution.id,
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
    this.subscribeToUrlNavigation();
  }

  private subscribeToUrlNavigation() {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        pairwise(), // Gives us [previousEvent, currentEvent]
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        this.isAnalyticsRoute$.pipe(take(1)).subscribe((isAnalyticsRoute) => {
          let params = this._urlParamsService.collectUrlParams();
          if (!isAnalyticsRoute && params.timeRange) {
            // analytics route takes care of updating the url itself
            this.updateTimeRangeSelection(params.timeRange!);
          }
        });
      });
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

    this.execution$
      .pipe(
        map((execution) => execution?.id),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this._aggregatedTreeTabState.searchCtrl.setValue('');
        this._aggregatedTreeWidgetState.searchCtrl.setValue('');
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

  private createAggregatedReportViewDatasource(items: AggregatedReportView[]): TableDataSource<AggregatedReportView> {
    return new TableLocalDataSource(
      items,
      TableLocalDataSource.configBuilder<AggregatedReportView>()
        .addSearchStringPredicate(
          'name',
          (item) => item.singleInstanceReportNode?.name ?? item?.artefact?.attributes?.['name'] ?? '',
        )
        .addSearchStringRegexPredicate('status', (item) =>
          Object.keys(item.countByStatus ?? {})
            .join(' ')
            .toLowerCase(),
        )
        .build(),
    );
  }

  private aggregateReportNodes(reportNodes: ReportNode[]): AggregatedReportViewExt[] {
    const artefactHashes: string[] = [];
    const groupedData = new Map<string, ReportNode[]>();
    reportNodes.forEach((reportNode) => {
      const hash = reportNode.artefactHash;
      if (!hash) {
        return;
      }
      let list = groupedData.get(hash);
      if (!list) {
        list = [] as ReportNode[];
        groupedData.set(hash, list);
        artefactHashes.push(hash);
      }
      list.push(reportNode);
    });

    return artefactHashes.map((artefactHash) => {
      const nodes = groupedData.get(artefactHash)!;
      const artefact = nodes[0].resolvedArtefact;
      const singleInstanceReportNode = nodes.length === 1 ? nodes[0] : undefined;
      const countByStatus = nodes.reduce(
        (res, node) => {
          const status = node.status;
          if (!status) {
            return res;
          }
          if (!res[status]) {
            res[status] = 1;
          } else {
            res[status]++;
          }
          return res;
        },
        {} as Record<string, number>,
      );
      let averageDuration = nodes.reduce((res, node) => res + (node?.duration ?? 0), 0);
      averageDuration = Math.round(averageDuration / nodes.length);
      return {
        artefactHash,
        artefact,
        singleInstanceReportNode,
        countByStatus,
        averageDuration,
      };
    });
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
      } else if (selection.type === 'FULL') {
        selection.absoluteSelection = { from: execution.startTime!, to: execution.endTime! };
      }
      this._activeExecutionsService.getActiveExecution(this._executionId()).updateTimeRange(selection);
    });
  }
}
