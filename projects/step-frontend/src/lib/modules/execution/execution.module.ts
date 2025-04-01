import { inject, Injectable, NgModule } from '@angular/core';
import { ExecutionListComponent } from './components/execution-list/execution-list.component';
import { Status, StepCommonModule } from '../_common/step-common.module';
import { StatusComponent } from './components/status/status.component';
import { StatusDistributionComponent } from './components/status-distribution/status-distribution.component';
import { ExecutionResultComponent } from './components/execution-result/execution-result.component';

import { ExecutionStepComponent } from './components/execution-step/execution-step.component';
import './components/execution-step/execution-step.component';

import { PanelIdPipe } from './pipes/panel-id.pipe';
import { OperationsModule } from '../operations/operations.module';
import { KeywordCallsComponent } from './components/keyword-calls/keyword-calls.component';
import { ReportNodesModule } from '../report-nodes/report-nodes.module';
import {
  AugmentedExecutionsService,
  AugmentedControllerService,
  DashletRegistryService,
  dialogRoute,
  EntityRegistry,
  IncludeTestcases,
  NAVIGATOR_QUERY_PARAMS_CLEANUP,
  NavigatorService,
  preloadScreenDataResolver,
  schedulePlanRoute,
  stepRouteAdditionalConfig,
  TreeNodeUtilsService,
  ViewRegistryService,
  DialogParentService,
  TreeStateService,
  InfoBannerService,
  sequenceCanActivateGuards,
  checkEntityGuardFactory,
  CommonEntitiesUrlsService,
} from '@exense/step-core';
import { ExecutionErrorsComponent } from './components/execution-errors/execution-errors.component';
import { RepositoryPlanTestcaseListComponent } from './components/repository-plan-testcase-list/repository-plan-testcase-list.component';
import { ExecutionTreeComponent } from './components/execution-tree/execution-tree.component';
import { ExecutionCommandsComponent } from './components/execution-commands/execution-commands.component';
import { ExecutionProgressComponent } from './components/execution-progress/execution-progress.component';
import { DashletExecutionStepComponent } from './components/dashlet-execution-step/dashlet-execution-step.component';
import { DashletExecutionTreeComponent } from './components/dashlet-execution-tree/dashlet-execution-tree.component';
import { IncludeTabPipe } from './pipes/include-tab.pipe';
import { DashletExecutionVizComponent } from './components/dashlet-execution-viz/dashlet-execution-viz.component';
import { TimeSeriesModule } from '../timeseries/time-series.module';
import { DashletExecutionErrorsComponent } from './components/dashlet-execution-errors/dashlet-execution-errors.component';
import { PanelExecutionDetailsComponent } from './components/panel-execution-details/panel-execution-details.component';
import { PanelComponent } from './components/panel/panel.component';
import { PanelOperationsComponent } from './components/panel-operations/panel-operations.component';
import { RepositoryComponent } from './components/repository/repository.component';
import { ExecutionSelectionTableComponent } from './components/execution-selection-table/execution-selection-table.component';
import { ExecutionBulkOperationsRegisterService } from './services/execution-bulk-operations-register.service';
import { IsExecutionProgressPipe } from './pipes/is-execution-progress.pipe';
import { ExecutionOpenerComponent } from './components/execution-opener/execution-opener.component';
import { ExecutionRunningStatusHeaderComponent } from './components/execution-running-status-header/execution-running-status-header.component';
import { ExecutionStatusComponent } from './components/execution-status/execution-status.component';
import { ExecutionDurationComponent } from './components/execution-duration/execution-duration.component';
import { ScheduleOverviewComponent } from './components/schedule-overview/schedule-overview.component';
import { AltExecutionsComponent } from './components/alt-executions/alt-executions.component';
import { AltExecutionProgressComponent } from './components/alt-execution-progress/alt-execution-progress.component';
import { AltExecutionReportComponent } from './components/alt-execution-report/alt-execution-report.component';
import { AltExecutionAnalyticsComponent } from './components/alt-execution-analytics/alt-execution-analytics.component';
import { AltReportNodeSummaryComponent } from './components/alt-report-node-summary/alt-report-node-summary.component';
import { AltReportNodeListComponent } from './components/alt-report-node-list/alt-report-node-list.component';
import { AltExecutionTimeComponent } from './components/alt-execution-time/alt-execution-time.component';
import { ExecutionActionsComponent } from './components/execution-actions/execution-actions.component';
import { AltReportPerformanceOverviewChartComponent } from './components/alt-report-performance-overview-chart/alt-report-performance-overview-chart.component';
import { AltReportCurrentOperationsComponent } from './components/alt-report-current-operations/alt-report-current-operations.component';
import { AltReportWidgetComponent } from './components/alt-report-widget/alt-report-widget.component';
import { AltReportWidgetFilterDirective } from './directives/alt-report-widget-filter.directive';
import { AltReportWidgetContentDirective } from './directives/alt-report-widget-content.directive';
import { AltReportNodeKeywordsComponent } from './components/alt-report-node-keywords/alt-report-node-keywords.component';
import { AltReportNodesTestcasesComponent } from './components/alt-report-nodes-testcases/alt-report-nodes-testcases.component';
import { ExecutionDetailsComponent } from './components/execution-details/execution-details.component';
import { AggregatedTreeStatusComponent } from './components/aggregated-tree-status/aggregated-tree-status.component';
import { AppliedStatusPipe } from './pipes/applied-status.pipe';
import { AltExecutionTreeTabComponent } from './components/alt-execution-tree-tab/alt-execution-tree-tab.component';
import { AltKeywordDrilldownComponent } from './components/alt-keyword-drilldown/alt-keyword-drilldown.component';
import { AltExecutionTabsComponent } from './components/alt-execution-tabs/alt-execution-tabs.component';
import { AltExecutionReportControlsComponent } from './components/alt-execution-report-controls/alt-execution-report-controls.component';
import { AggregatedTreeNodeComponent } from './components/aggregated-tree-node/aggregated-tree-node.component';
import { ViewMode } from './shared/view-mode';
import { TreeNodeDescriptionPipe } from './pipes/tree-node-description.pipe';
import { ExecutionActionsExecuteContentDirective } from './directives/execution-actions-execute-content.directive';
import { altExecutionGuard } from './guards/alt-execution.guard';
import { legacyExecutionGuard } from './guards/legacy-execution.guard';
import { executionDeactivateGuard } from './guards/execution-deactivate.guard';
import { AltReportNodeDetailsComponent } from './components/alt-keyword-inline-drilldown/alt-report-node-details.component';
import { AggregatedTreeNodeIterationListComponent } from './components/aggregated-tree-node-iteration-list/aggregated-tree-node-iteration-list.component';
import { ArtefactsModule } from '../artefacts/artefacts.module';
import { AltReportWidgetSortDirective } from './directives/alt-report-widget-sort.directive';
import { DoughnutChartComponent } from '../timeseries/components/doughnut-chart/doughnut-chart.component';
import { AltExecutionRepositoryComponent } from './components/alt-execution-repository/alt-execution-repository.component';
import { ExecutionCommandsDirective } from './directives/execution-commands.directive';
import { AltExecutionParametersComponent } from './components/alt-execution-parameters/alt-execution-parameters.component';
import { AltExecutionLaunchDialogComponent } from './components/alt-execution-launch-dialog/alt-execution-launch-dialog.component';
import { ActiveExecutionsService } from './services/active-executions.service';
import { ActiveExecutionContextService } from './services/active-execution-context.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AggregatedReportViewTreeNodeUtilsService } from './services/aggregated-report-view-tree-node-utils.service';
import {
  AGGREGATED_TREE_TAB_STATE,
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateContextService,
  AggregatedReportViewTreeStateService,
} from './services/aggregated-report-view-tree-state.service';
import { AltReportNodeDetailsStateService } from './services/alt-report-node-details-state.service';
import { AltExecutionTreeComponent } from './components/alt-execution-tree/alt-execution-tree.component';
import { AltExecutionTreeWidgetComponent } from './components/alt-execution-tree-widget/alt-execution-tree-widget.component';
import { AggregatedTreeNodeDialogComponent } from './components/aggregated-tree-node-dialog/aggregated-tree-node-dialog.component';
import { ExecutionLegacySwitcherComponent } from './components/execution-legacy-switcher/execution-legacy-switcher.component';
import { PlanNodeDetailsDialogComponent } from './components/plan-node-details-dialog/plan-node-details-dialog.component';
import { REPORT_NODE_DETAILS_QUERY_PARAMS } from './services/report-node-details-query-params.token';
import { ExecutionNavigatorQueryParamsCleanupService } from './services/execution-navigator-query-params-cleanup.service';
import { AltPanelComponent } from './components/alt-panel/alt-panel.component';
import { AltExecutionTreePartialTabComponent } from './components/alt-execution-tree-partial-tab/alt-execution-tree-partial-tab.component';
import { ExecutionViewDialogUrlCleanupService } from './services/execution-view-dialog-url-cleanup-service';
import { TimeRangePickerComponent } from '../timeseries/modules/_common/components/time-range-picker/time-range-picker.component';
import { StatusCountBadgeComponent } from './components/status-count-badge/status-count-badge.component';
import { TimeSeriesChartComponent } from '../timeseries/modules/chart';
import { ExecutionsChartTooltipComponent } from './components/schedule-overview/executions-chart-tooltip/executions-chart-tooltip.component';
import { TooltipContentDirective } from '../timeseries/modules/chart/components/time-series-chart/tooltip-content.directive';
import { ErrorDetailsMenuComponent } from './components/error-details-menu/error-details-menu.component';
import { AltExecutionErrorsComponent } from './components/alt-execution-errors/alt-execution-errors.component';
import { AgentsCellComponent } from './components/execution-agent-cell/execution-agent-cell.component';
import { AgentsModalComponent } from './components/execution-agent-modal/execution-agent-modal.component';
import { AltExecutionResolvedParametersComponent } from './components/alt-execution-resolved-parameters/alt-execution-resolved-parameters.component';

@NgModule({
  declarations: [
    ExecutionListComponent,
    StatusComponent,
    StatusDistributionComponent,
    StatusCountBadgeComponent,
    ExecutionResultComponent,
    ExecutionStepComponent,
    PanelIdPipe,
    KeywordCallsComponent,
    RepositoryPlanTestcaseListComponent,
    ExecutionErrorsComponent,
    ExecutionTreeComponent,
    RepositoryComponent,
    ExecutionActionsComponent,
    ExecutionCommandsDirective,
    ExecutionCommandsComponent,
    ExecutionProgressComponent,
    DashletExecutionStepComponent,
    DashletExecutionTreeComponent,
    IncludeTabPipe,
    DashletExecutionVizComponent,
    DashletExecutionErrorsComponent,
    PanelExecutionDetailsComponent,
    PanelComponent,
    PanelOperationsComponent,
    ExecutionSelectionTableComponent,
    IsExecutionProgressPipe,
    ExecutionOpenerComponent,
    ExecutionRunningStatusHeaderComponent,
    ExecutionStatusComponent,
    ExecutionDurationComponent,
    ScheduleOverviewComponent,
    AltExecutionsComponent,
    AltExecutionTabsComponent,
    AltExecutionProgressComponent,
    AltExecutionResolvedParametersComponent,
    AltExecutionReportComponent,
    AltExecutionReportControlsComponent,
    AltExecutionAnalyticsComponent,
    AltReportNodeSummaryComponent,
    AltReportNodeListComponent,
    AltExecutionTimeComponent,
    AltReportPerformanceOverviewChartComponent,
    AltReportCurrentOperationsComponent,
    AltReportWidgetComponent,
    AltReportWidgetFilterDirective,
    AltReportWidgetSortDirective,
    AltReportWidgetContentDirective,
    AltReportNodeKeywordsComponent,
    AltReportNodesTestcasesComponent,
    AltExecutionRepositoryComponent,
    AltExecutionTreeComponent,
    AltExecutionTreeTabComponent,
    AltExecutionTreeWidgetComponent,
    AltKeywordDrilldownComponent,
    AltExecutionParametersComponent,
    AltReportNodeDetailsComponent,
    AltExecutionLaunchDialogComponent,
    AltExecutionTreePartialTabComponent,
    ExecutionDetailsComponent,
    AggregatedTreeStatusComponent,
    AggregatedTreeNodeComponent,
    AppliedStatusPipe,
    TreeNodeDescriptionPipe,
    ExecutionActionsExecuteContentDirective,
    AggregatedTreeNodeIterationListComponent,
    AggregatedTreeNodeDialogComponent,
    ExecutionLegacySwitcherComponent,
    PlanNodeDetailsDialogComponent,
    AltPanelComponent,
    ExecutionsChartTooltipComponent,
    ErrorDetailsMenuComponent,
    AltExecutionErrorsComponent,
    AgentsCellComponent,
    AgentsModalComponent,
  ],
  imports: [
    StepCommonModule,
    OperationsModule,
    ReportNodesModule,
    TimeSeriesModule,
    ArtefactsModule,
    DoughnutChartComponent,
    TimeSeriesChartComponent,
    TooltipContentDirective,
    TimeRangePickerComponent,
  ],
  exports: [
    ExecutionListComponent,
    ExecutionStepComponent,
    ExecutionErrorsComponent,
    KeywordCallsComponent,
    ExecutionTreeComponent,
    ExecutionCommandsDirective,
    ExecutionCommandsComponent,
    ExecutionProgressComponent,
    RepositoryComponent,
    ExecutionSelectionTableComponent,
    ExecutionDurationComponent,
    StatusComponent,
    AltExecutionsComponent,
    AltExecutionProgressComponent,
    AltExecutionReportComponent,
    AltExecutionReportControlsComponent,
    AltExecutionAnalyticsComponent,
    AltExecutionTreeComponent,
    AltExecutionTreeTabComponent,
    AltExecutionTreeWidgetComponent,
    AltKeywordDrilldownComponent,
    AltReportNodeDetailsComponent,
    AltExecutionLaunchDialogComponent,
    AltReportWidgetComponent,
    ExecutionLegacySwitcherComponent,
  ],
  providers: [
    {
      provide: NAVIGATOR_QUERY_PARAMS_CLEANUP,
      useClass: ExecutionNavigatorQueryParamsCleanupService,
      multi: true,
    },
  ],
})
export class ExecutionModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _dashletRegistry: DashletRegistryService,
    private _viewRegistry: ViewRegistryService,
    private _infoBanner: InfoBannerService,
    _bulkOperationsRegistry: ExecutionBulkOperationsRegisterService,
  ) {
    _bulkOperationsRegistry.register();
    this.registerEntities();
    this.registerDashlets();
    this.registerRoutes();
    this.registerInfoBanners();
  }

  private registerEntities(): void {
    this._entityRegistry.register('executions', 'Execution', {
      icon: 'rocket',
      component: ExecutionSelectionTableComponent,
    });

    this._entityRegistry.registerEntity('Repository', 'repository', 'database');
  }

  private registerDashlets(): void {
    this._dashletRegistry.registerDashlet('executionStep', DashletExecutionStepComponent);
    this._dashletRegistry.registerDashlet('executionTree', DashletExecutionTreeComponent);
    this._dashletRegistry.registerDashlet('executionViz', DashletExecutionVizComponent);
    this._dashletRegistry.registerDashlet('executionError', DashletExecutionErrorsComponent);

    this._viewRegistry.registerDashletAdvanced(
      'executionTabMigrated',
      'Execution steps',
      'executionStep',
      'steps',
      0,
      () => true,
    );

    this._viewRegistry.registerDashletAdvanced(
      'executionTabMigrated',
      'Execution tree',
      'executionTree',
      'tree',
      1,
      function () {
        return true;
      },
    );

    this._viewRegistry.registerDashletAdvanced(
      'executionTabMigrated',
      'Performance',
      'executionViz',
      'viz',
      2,
      function () {
        return true;
      },
    );

    this._viewRegistry.registerDashletAdvanced(
      'executionTabMigrated',
      'Errors',
      'executionError',
      'errors',
      3,
      function () {
        return true;
      },
    );
  }

  private registerRoutes(): void {
    this._viewRegistry.registerRoute(
      stepRouteAdditionalConfig(
        { quickAccessAlias: 'repository' },
        {
          path: 'repository',
          component: RepositoryComponent,
          children: [schedulePlanRoute()],
        },
      ),
    );

    this._viewRegistry.registerRoute({
      path: 'legacy-executions',
      canDeactivate: [executionDeactivateGuard, () => inject(ActiveExecutionsService).cleanup()],
      resolve: {
        executionParametersScreenData: preloadScreenDataResolver('executionParameters'),
        forceActivateViewId: () => inject(NavigatorService).forceActivateView('executions'),
      },
      component: AltExecutionsComponent,
      providers: [ActiveExecutionsService],
      children: [
        {
          path: '',
          redirectTo: 'list',
        },
        {
          path: 'list',
          component: ExecutionListComponent,
        },
        {
          // This additional route is required, to rerender the execution progress component properly
          // when the user navigates from one execution to another
          path: 'open/:id',
          component: ExecutionOpenerComponent,
        },
        stepRouteAdditionalConfig(
          {
            quickAccessAlias: 'legacyExecutionProgress',
          },
          {
            matcher: (url) => {
              if (url[0].path === 'list' || url[0].path === 'open') {
                return null;
              }
              return { consumed: url };
            },
            canActivate: [
              sequenceCanActivateGuards([
                checkEntityGuardFactory({
                  entityType: 'execution',
                  idExtractor: (route) => route.url[0].path,
                  getEntity: (id) => inject(AugmentedExecutionsService).getExecutionByIdCached(id),
                  getEditorUrl: (id) => inject(CommonEntitiesUrlsService).legacyExecutionUrl(id),
                }),
                altExecutionGuard,
              ]),
              legacyExecutionGuard,
            ],
            canDeactivate: [
              () => {
                inject(AugmentedExecutionsService).cleanupCache();
                return true;
              },
            ],
            component: ExecutionProgressComponent,
            children: [schedulePlanRoute('modal')],
          },
        ),
      ],
    });
    this._viewRegistry.registerRoute({
      path: 'cross-executions/:id',
      component: ScheduleOverviewComponent,
    });
    this._viewRegistry.registerRoute({
      path: 'executions',
      component: AltExecutionsComponent,
      resolve: {
        executionParametersScreenData: preloadScreenDataResolver('executionParameters'),
      },
      canDeactivate: [
        executionDeactivateGuard,
        () => inject(NavigatorService).cleanupActivateView(),
        () => inject(ActiveExecutionsService).cleanup(),
      ],
      providers: [ActiveExecutionsService],
      children: [
        {
          path: '',
          redirectTo: 'list',
        },
        {
          path: 'list',
          component: ExecutionListComponent,
        },
        {
          // This additional route is required, to rerender the execution progress component properly
          // when the user navigates from one execution to another
          path: 'open/:id',
          component: ExecutionOpenerComponent,
        },
        {
          path: ':id',
          canActivate: [
            sequenceCanActivateGuards([
              checkEntityGuardFactory({
                entityType: 'execution',
                getEntity: (id) => inject(AugmentedExecutionsService).getExecutionByIdCached(id),
                getEditorUrl: (id) => inject(CommonEntitiesUrlsService).executionUrl(id),
              }),
              altExecutionGuard,
            ]),
            (route: ActivatedRouteSnapshot) => {
              const id = route.params['id'];
              inject(ActiveExecutionContextService).setupExecutionId(id);
              return true;
            },
          ],
          component: AltExecutionProgressComponent,
          providers: [
            AggregatedReportViewTreeNodeUtilsService,
            {
              provide: DialogParentService,
              useClass: ExecutionViewDialogUrlCleanupService,
            },
            {
              provide: TreeNodeUtilsService,
              useExisting: AggregatedReportViewTreeNodeUtilsService,
            },
            {
              provide: AGGREGATED_TREE_TAB_STATE,
              useClass: AggregatedReportViewTreeStateService,
            },
            {
              provide: AGGREGATED_TREE_WIDGET_STATE,
              useClass: AggregatedReportViewTreeStateService,
            },
            AltReportNodeDetailsStateService,
            ActiveExecutionContextService,
            AggregatedReportViewTreeStateContextService,
          ],
          canDeactivate: [
            () => {
              inject(AugmentedExecutionsService).cleanupCache();
              return true;
            },
            () => inject(AGGREGATED_TREE_TAB_STATE).cleanup(),
            () => inject(AGGREGATED_TREE_WIDGET_STATE).cleanup(),
            () => inject(AltReportNodeDetailsStateService).cleanup(),
            () => inject(AggregatedReportViewTreeStateContextService).cleanup(),
          ],
          children: [
            {
              path: '',
              redirectTo: 'report',
            },
            stepRouteAdditionalConfig(
              {
                quickAccessAlias: 'executionReport',
              },
              {
                path: 'report',
                data: {
                  mode: ViewMode.VIEW,
                },
                canActivate: [
                  () => {
                    const ctx = inject(AggregatedReportViewTreeStateContextService);
                    const treeState = inject(AGGREGATED_TREE_WIDGET_STATE);
                    ctx.setState(treeState);
                    return true;
                  },
                ],
                children: [
                  {
                    path: '',
                    component: AltExecutionReportComponent,
                  },
                  {
                    path: '',
                    component: AltExecutionReportControlsComponent,
                    outlet: 'controls',
                  },
                ],
              },
            ),
            {
              path: 'report-print',
              data: {
                mode: ViewMode.PRINT,
              },
              children: [
                {
                  path: '',
                  component: AltExecutionReportComponent,
                },
              ],
            },
            {
              path: 'tree',
              canActivate: [
                () => {
                  const ctx = inject(AggregatedReportViewTreeStateContextService);
                  const treeState = inject(AGGREGATED_TREE_TAB_STATE);
                  ctx.setState(treeState);
                  return true;
                },
              ],
              children: [
                {
                  path: '',
                  component: AltExecutionTreeTabComponent,
                },
              ],
            },
            {
              path: 'sub-tree/:reportNodeId',
              providers: [
                AggregatedReportViewTreeStateService,
                {
                  provide: TreeStateService,
                  useExisting: AggregatedReportViewTreeStateService,
                },
              ],
              canActivate: [
                () => {
                  const ctx = inject(AggregatedReportViewTreeStateContextService);
                  const treeState = inject(AggregatedReportViewTreeStateService);
                  ctx.setState(treeState);
                  return true;
                },
              ],
              canDeactivate: [() => inject(TreeStateService).cleanup()],
              children: [
                {
                  path: '',
                  component: AltExecutionTreePartialTabComponent,
                },
              ],
            },
            {
              path: 'analytics',
              component: AltExecutionAnalyticsComponent,
            },
            {
              path: `keyword-drilldown/:keywordId`,
              component: AltKeywordDrilldownComponent,
            },
            schedulePlanRoute('modal'),
            dialogRoute({
              path: 'launch',
              outlet: 'modal',
              dialogComponent: AltExecutionLaunchDialogComponent,
              data: {
                title: 'Relaunch Execution',
              },
              resolve: {
                repoRef: () => {
                  const _context = inject(ActiveExecutionContextService);
                  return _context.execution$.pipe(
                    take(1),
                    map((execution) => execution?.executionParameters?.repositoryObject),
                  );
                },
                parameters: () => {
                  const _context = inject(ActiveExecutionContextService);
                  return _context.execution$.pipe(
                    take(1),
                    map((execution) => execution?.executionParameters?.customParameters),
                  );
                },
                testCases: () => {
                  const _context = inject(ActiveExecutionContextService);
                  const _executionsApi = inject(AugmentedExecutionsService);
                  return _context.execution$.pipe(
                    take(1),
                    map((execution) => execution?.id),
                    switchMap((id) => {
                      if (!id) {
                        return of([]);
                      }
                      return _executionsApi.getReportNodesByExecutionId(
                        id,
                        'step.artefacts.reports.TestCaseReportNode',
                        500,
                      );
                    }),
                    catchError(() => of(undefined)),
                    map((testCases) => {
                      const list = testCases
                        ?.filter((item) => !!item && item?.status !== 'SKIPPED')
                        ?.map((item) => item?.artefactID!);
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
                },
              },
            }),
            dialogRoute(
              {
                path: 'node-details',
                outlet: 'nodeDetails',
                resolve: {
                  aggregatedNode: (route: ActivatedRouteSnapshot) => {
                    const _state = inject(AggregatedReportViewTreeStateContextService).getState();
                    const _queryParamNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
                    const aggregatedNodeId = route.queryParams[_queryParamNames.aggregatedNodeId];
                    if (!aggregatedNodeId) {
                      return undefined;
                    }
                    return _state.findNodeById(aggregatedNodeId);
                  },
                  resolvedPartialPath: () =>
                    inject(AggregatedReportViewTreeStateContextService).getState().resolvedPartialPath(),
                  reportNode: (route: ActivatedRouteSnapshot) => {
                    const _reportNodeDetailsState = inject(AltReportNodeDetailsStateService);
                    const _controllerService = inject(AugmentedControllerService);
                    const _queryParamNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
                    const reportNodeId = route.queryParams[_queryParamNames.reportNodeId];
                    if (!reportNodeId) {
                      return undefined;
                    }
                    const reportNode = _reportNodeDetailsState.getReportNode(reportNodeId);
                    if (reportNode) {
                      return reportNode;
                    }
                    return _controllerService.getReportNode(reportNodeId);
                  },
                  searchStatus: (route: ActivatedRouteSnapshot) => {
                    const _queryParamNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
                    return route.queryParams[_queryParamNames.searchStatus] as Status | undefined;
                  },
                  searchStatusCount: (route: ActivatedRouteSnapshot) => {
                    const _queryParamNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
                    const statusCountStr = route.queryParams[_queryParamNames.searchStatusCount];
                    const statusCount = parseInt(statusCountStr);
                    return isNaN(statusCount) ? undefined : statusCount;
                  },
                },
                dialogComponent: AggregatedTreeNodeDialogComponent,
                children: [
                  dialogRoute({
                    path: 'plan-node',
                    dialogComponent: PlanNodeDetailsDialogComponent,
                  }),
                ],
              },
              {
                hasBackdrop: false,
                height: '100%',
                width: '40%',
                panelClass: 'side-dialog',
                position: {
                  right: '0',
                  top: '0',
                  bottom: '0',
                },
              },
            ),
            {
              path: 'viz',
              redirectTo: 'analytics',
            },
            {
              path: 'steps',
              redirectTo: 'report',
            },
            {
              path: 'errors',
              redirectTo: 'report',
            },
          ],
        },
      ],
    });
  }

  private registerInfoBanners(): void {}
}

export { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from './shared/type-leaf-report-nodes-table-params';
export { KeywordParameters } from './shared/keyword-parameters';
export * from './components/alt-execution-launch-dialog/alt-execution-launch-dialog.component';
export * from './services/scheduler-invoker.service';
