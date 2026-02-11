import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import {
  Component,
  DestroyRef,
  forwardRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  catchError,
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
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  AggregatedReportView,
  AlertType,
  AugmentedControllerService,
  AugmentedExecutionsService,
  AugmentedPlansService,
  AugmentedTimeSeriesService,
  combineLatestWithTrackChanges,
  DateUtilsService,
  EntityRefService,
  Execution,
  EXECUTION_REPORT_GRID,
  ExecutionCloseHandleService,
  IncludeTestcases,
  IS_SMALL_SCREEN,
  PopoverMode,
  provideGridLayoutConfig,
  ReloadableDirective,
  ReportNode,
  smartSwitchMap,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
  TimeSeriesErrorEntry,
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
import { convertPickerSelectionToTimeRange } from '../../shared/convert-picker-selection';
import { TimeRangeExt } from '../../shared/time-range-ext';

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
  host: {
    '[class.small-screen]': 'isSmallScreen()',
  },
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
    {
      provide: EntityRefService,
      useExisting: forwardRef(() => AltExecutionProgressComponent),
    },
    AggregatedTreeDataLoaderService,
    ...provideGridLayoutConfig(EXECUTION_REPORT_GRID),
  ],
  standalone: false,
})
export class AltExecutionProgressComponent
  implements OnInit, OnDestroy, AltExecutionStateService, EntityRefService<Execution>
{
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
  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private _executionId = inject(EXECUTION_ID);
  private _dateUtils = inject(DateUtilsService);
  protected readonly _dialogs = inject(AltExecutionDialogsService);
  private _router = inject(Router);
  protected readonly AlertType = AlertType;
  private _treeLoader = inject(AggregatedTreeDataLoaderService);

  protected readonly isSmallScreen = toSignal(this._isSmallScreen$);
  private readonly toggleRequestWarning = viewChild('requestWarningRef', { read: ToggleRequestWarningDirective });

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

  private readonly execution = toSignal(this.execution$, { initialValue: undefined });

  protected isAnalyticsRoute$ = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null), // Emit an initial value when the component loads
    map(() => this._router.url.includes('/analytics')),
    shareReplay(1),
  );

  protected readonly isAnalyticsRoute = toSignal(this.isAnalyticsRoute$);

  /** Active execution's range selection data stream **/
  readonly timeRangeSelection$ = this.activeExecution$.pipe(
    switchMap((activeExecution) => activeExecution.timeRangeSelectionChange$.pipe(debounceTime(200))),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  /** Subscribes to active execution's range selection data stream and update url's parameters **/
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

  protected handleTimeRangeChange(selection: TimeRangePickerSelection): void {
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
  protected readonly isResolvedParametersVisible = signal(false);
  protected readonly isAgentsVisible = signal(false);

  readonly displayStatus$ = this.execution$.pipe(
    map((execution) => (execution?.status === 'ENDED' ? execution?.result : execution?.status)),
  );

  readonly isFullRangeSelected$ = this.timeRangeSelection$.pipe(
    map((selection) => {
      return selection.type === 'FULL';
    }),
  );

  readonly timeRange$: Observable<TimeRangeExt> = combineLatestWithTrackChanges([
    this.timeRangeSelection$,
    this.execution$,
  ]).pipe(
    map(({ result, isChanged }) => {
      const [rangeSelection, execution] = result;
      const [rangeSelectionChanged] = isChanged;
      const timeRange = convertPickerSelectionToTimeRange(rangeSelection, execution, this._executionId());
      if (!timeRange) {
        return undefined;
      }
      const isManualChange = execution.id !== this._executionId() || !!rangeSelectionChanged;
      return { ...timeRange, isManualChange } as TimeRangeExt;
    }),
    filter((range): range is TimeRangeExt => range !== undefined),
    shareReplay(1),
  ) as Observable<TimeRangeExt>;

  readonly fullTimeRangeLabel = this.timeRange$.pipe(map((range) => TimeSeriesUtils.formatRange(range)));

  readonly isExecutionCompleted$ = this.execution$.pipe(map((execution) => execution.status === 'ENDED'));

  readonly testCases$ = combineLatest([this.execution$.pipe(startWith(undefined)), this.timeRangeSelection$]).pipe(
    map(([execution, timeRangeSelection]) => ({ execution, timeRangeSelection })),
    smartSwitchMap(
      (curr, prev) => {
        return (
          curr.execution?.id !== prev?.execution?.id ||
          !this._dateUtils.areTimeRangeSelectionsEquals(curr.timeRangeSelection, prev?.timeRangeSelection)
        );
      },
      ({ execution, timeRangeSelection }) => {
        if (!execution?.id || !timeRangeSelection) {
          return of(undefined);
        }
        return this._executionsApi.getFlatAggregatedReportView(execution.id, {
          range: convertPickerSelectionToTimeRange(timeRangeSelection, execution, this._executionId()),
          filterArtefactClasses: ['TestCase'],
          fetchCurrentOperations: true,
        });
      },
      this._destroyRef,
      (duration) => this._activeExecutionContext.adjustAutoRefresh(duration),
    ),
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
    distinctUntilChanged((a, b) => a.eid === b.eid),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private keywordsDataSource = (this._controllerService.createDataSource() as TableDataSource<ReportNode>).sharable();

  /**
   * Logic to reload keyword's datasource when execution is refreshed
   * **/
  private refreshKeywordsSubscription = this.execution$
    .pipe(
      map((execution) => execution.id),
      pairwise(),
      filter((pair) => pair[0] === pair[1]),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.keywordsDataSource.reload({ isForce: false }));

  readonly keywordsDataSource$ = of(this.keywordsDataSource);

  readonly errors$ = combineLatest([this.execution$, this.timeRangeSelection$]).pipe(
    map(([execution, timeRangeSelection]) => ({ execution, timeRangeSelection })),
    smartSwitchMap(
      (curr, prev) => {
        return (
          curr.execution?.id !== prev?.execution?.id ||
          !this._dateUtils.areTimeRangeSelectionsEquals(curr.timeRangeSelection, prev?.timeRangeSelection)
        );
      },
      ({ execution, timeRangeSelection }) => {
        const executionId = execution?.id;
        const timeRange = convertPickerSelectionToTimeRange(timeRangeSelection, execution, this._executionId());
        if (!executionId || !timeRange) {
          return of([]);
        }
        return this._timeSeriesService.findErrors({ executionId, timeRange });
      },
      this._destroyRef,
      (duration) => this._activeExecutionContext.adjustAutoRefresh(duration),
    ),
    catchError(() => of([] as TimeSeriesErrorEntry[])),
    map((errors) => (!errors?.length ? undefined : errors)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly availableErrorTypes$ = this.errors$.pipe(
    map((items) => (items ?? []).reduce((res, item) => [...res, ...item.types], [] as string[])),
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
    smartSwitchMap(
      (curr, prev) => curr !== prev,
      (eId) => {
        if (!eId) {
          return of(undefined);
        }
        return this._systemService.getCurrentOperations(eId);
      },
      this._destroyRef,
      (duration) => this._activeExecutionContext.adjustAutoRefresh(duration),
    ),
  );

  ngOnInit(): void {
    this.setupTreeRefresh();
    this.setupToggleWarningReset();
    this.setupNavigationHistoryChange();
  }

  readonly currentEntity = this.execution;

  private setupNavigationHistoryChange(): void {
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
          const urlParams = this._urlParamsService.collectUrlParams();
          if (urlParams.timeRange) {
            this.updateTimeRangeSelection(urlParams.timeRange);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.keywordsDataSource.destroy();
    this.testCasesDataSource?.destroy();
  }

  private setupTreeRefresh(): void {
    combineLatest([this.execution$, this.timeRangeSelection$])
      .pipe(
        map(([execution, timeRangeSelection]) => ({ execution, timeRangeSelection })),
        debounceTime(300),
        smartSwitchMap(
          (curr, prev) => {
            return (
              curr.execution.id !== prev?.execution?.id ||
              !this._dateUtils.areTimeRangeSelectionsEquals(curr.timeRangeSelection, prev?.timeRangeSelection)
            );
          },
          ({ execution, timeRangeSelection }) => {
            return this._treeLoader.load(execution, timeRangeSelection);
          },
          this._destroyRef,
          (duration) => this._activeExecutionContext.adjustAutoRefresh(duration),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(({ aggregatedReportView, resolvedPartialPath }) => {
        if (!aggregatedReportView) {
          this._aggregatedTreeTabState.init(undefined);
          this._aggregatedTreeWidgetState.init(undefined);
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

  /**
   * Updates time range selection data in active execution
   * **/
  updateTimeRangeSelection(selection: TimeRangePickerSelection): void {
    const execution = this.execution();
    if (!execution) {
      return;
    }
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
  }
}
