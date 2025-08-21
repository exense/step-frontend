import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  pairwise,
  scan,
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
  DateUtilsService,
  Execution,
  ExecutionCloseHandleService,
  IncludeTestcases,
  IS_SMALL_SCREEN,
  PopoverMode,
  ReloadableDirective,
  ReportNode,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
  TimeRange,
  ViewRegistryService,
} from '@exense/step-core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { AggregatedTreeDataLoaderService } from '../../services/aggregated-tree-data-loader.service';
import { ToggleRequestWarningDirective } from '../../directives/toggle-request-warning.directive';

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
  hostDirectives: [ReloadableDirective],
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
    AggregatedTreeDataLoaderService,
  ],
  standalone: false,
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
  private _dateUtils = inject(DateUtilsService);
  protected readonly _dialogs = inject(AltExecutionDialogsService);
  private _router = inject(Router);
  protected readonly AlertType = AlertType;
  private _treeLoader = inject(AggregatedTreeDataLoaderService);

  private toggleRequestWarning = viewChild('requestWarningRef', { read: ToggleRequestWarningDirective });

  readonly timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'FULL' },
    ...TimeSeriesConfig.EXECUTION_PAGE_TIME_SELECTION_OPTIONS,
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

  protected isAnalyticsRoute$ = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null), // Emit an initial value when the component loads
    map(() => this._router.url.includes('/analytics')),
    shareReplay(1),
  );

  protected isAnalyticsRoute = toSignal(this.isAnalyticsRoute$);

  readonly timeChangeTriggerOnExecutionChangeSubscription = this.activeExecution$
    .pipe(takeUntilDestroyed(), skip(1)) // skip initialization call.
    .subscribe((activeExecution) => {
      // force trigger time range change
      const timeRangeSelection = activeExecution.getTimeRangeSelection();
      setTimeout(() => {
        this.updateTimeRangeSelection({ ...timeRangeSelection });
      }, 100);
    });

  readonly timeRangeSelection$ = this.activeExecution$.pipe(
    switchMap((activeExecution) => activeExecution.timeRangeSelectionChange$.pipe(debounceTime(200))),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private updateUrlParamsSubscription = this.timeRangeSelection$
    .pipe(
      scan(
        (acc, range) => {
          const isFirst = !acc.hasEmitted;
          return { range, isFirst, hasEmitted: true };
        },
        { range: null as unknown as TimeRangePickerSelection, isFirst: true, hasEmitted: false },
      ),
      takeUntilDestroyed(),
    )
    .subscribe(({ range, isFirst }: { range: TimeRangePickerSelection; isFirst: boolean }) => {
      // analytics tab is handling events itself
      let analyticsRoute = this.isAnalyticsRoute();
      if (!analyticsRoute) {
        this._urlParamsService.patchUrlParams(range, undefined, isFirst);
      }
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

  readonly testCases$ = combineLatest([
    this.execution$.pipe(
      startWith(undefined),
      map((execution) => execution?.id),
    ),
    this.timeRange$,
  ]).pipe(
    switchMap(([id, range]) => {
      if (!id) {
        return of(undefined);
      }
      return this._executionsApi.getFlatAggregatedReportView(id, {
        range,
        filterArtefactClasses: ['TestCase'],
        fetchCurrentOperations: true,
      });
    }),
    map((result) => result?.aggregatedReportViews ?? []),
    shareReplay(1),
  );

  protected testCasesForRelaunch$ = this.testCases$.pipe(
    map((testCases) => testCases.map((item) => item.singleInstanceReportNode).filter((item) => !!item)),
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
    this.setupToggleWarningReset();
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
        // analytics tab is handling events itself
        const isAnalytics = this.isAnalyticsRoute();
        if (!isAnalytics) {
          let urlParams = this._urlParamsService.collectUrlParams();
          if (urlParams.timeRange) {
            this.updateTimeRangeSelection(urlParams.timeRange);
          }
        }
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
        debounceTime(300),
        switchMap(([execution, timeSelection]) => {
          return this._treeLoader.load(execution, timeSelection);
        }),
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

  private setupToggleWarningReset(): void {
    this.timeRangeSelection$
      .pipe(
        distinctUntilChanged((a, b) => this._dateUtils.areTimeRangeSelectionsEquals(a, b)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.toggleRequestWarning()?.resetWarning?.();
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
          selection.relativeSelection!.label = foundRelativeOption?.relativeSelection?.label;
        }
      } else if (selection.type === 'FULL') {
        selection.absoluteSelection = { from: execution.startTime!, to: execution.endTime! };
      }
      this._activeExecutionsService.getActiveExecution(this._executionId()).updateTimeRange(selection);
    });
  }
}
