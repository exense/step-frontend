import { inject, NgModule } from '@angular/core';
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
import { ExecutionTabsComponent } from './components/execution-tabs/execution-tabs.component';
import './components/execution-tabs/execution-tabs.component';
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
import { ExecutionsComponent } from './components/executions/executions.component';
import { ExecutionOpenerComponent } from './components/execution-opener/execution-opener.component';
import { ExecutionRunningStatusHeaderComponent } from './components/execution-running-status-header/execution-running-status-header.component';
import { ExecutionStatusComponent } from './components/execution-status/execution-status.component';
import { ExecutionDurationComponent } from './components/execution-duration/execution-duration.component';
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
import { AltExecutionRangePickerComponent } from './components/alt-execution-range-picker/alt-execution-range-picker.component';
import { AltExecutionRangePrintComponent } from './components/alt-execution-range-print/alt-execution-range-print.component';
import { ExecutionActionsExecuteContentDirective } from './directives/execution-actions-execute-content.directive';
import { altExecutionGuard } from './guards/alt-execution.guard';
import { executionGuard } from './guards/execution.guard';
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
  AggregatedReportViewTreeStateService,
} from './services/aggregated-report-view-tree-state.service';
import { AltReportNodeDetailsStateService } from './services/alt-report-node-details-state.service';
import { AltExecutionTreeComponent } from './components/alt-execution-tree/alt-execution-tree.component';
import { AltExecutionTreeWidgetComponent } from './components/alt-execution-tree-widget/alt-execution-tree-widget.component';
import { AggregatedTreeNodeDialogComponent } from './components/aggregated-tree-node-dialog/aggregated-tree-node-dialog.component';
import { PlanNodeDetailsDialogComponent } from './components/plan-node-details-dialog/plan-node-details-dialog.component';
import { REPORT_NODE_DETAILS_QUERY_PARAMS } from './services/report-node-details-query-params.token';
import { ExecutionNavigatorQueryParamsCleanupService } from './services/execution-navigator-query-params-cleanup.service';
import { TimeRangePickerComponent } from '../timeseries/modules/_common';
import { ExecutionViewDialogUrlCleanupService } from './services/execution-view-dialog-url-cleanup-service';

@NgModule({
  declarations: [
    ExecutionListComponent,
    StatusComponent,
    StatusDistributionComponent,
    ExecutionResultComponent,
    ExecutionStepComponent,
    PanelIdPipe,
    KeywordCallsComponent,
    ExecutionTabsComponent,
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
    ExecutionsComponent,
    ExecutionOpenerComponent,
    ExecutionRunningStatusHeaderComponent,
    ExecutionStatusComponent,
    ExecutionDurationComponent,
    AltExecutionsComponent,
    AltExecutionTabsComponent,
    AltExecutionProgressComponent,
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
    AltExecutionRangePickerComponent,
    AltExecutionRangePrintComponent,
    AltReportNodeDetailsComponent,
    AltExecutionLaunchDialogComponent,
    ExecutionDetailsComponent,
    AggregatedTreeStatusComponent,
    AggregatedTreeNodeComponent,
    AppliedStatusPipe,
    TreeNodeDescriptionPipe,
    ExecutionActionsExecuteContentDirective,
    AggregatedTreeNodeIterationListComponent,
    AggregatedTreeNodeDialogComponent,
    PlanNodeDetailsDialogComponent,
  ],
  imports: [
    StepCommonModule,
    OperationsModule,
    ReportNodesModule,
    TimeSeriesModule,
    ArtefactsModule,
    DoughnutChartComponent,
    TimeRangePickerComponent,
  ],
  exports: [
    ExecutionListComponent,
    ExecutionStepComponent,
    ExecutionTabsComponent,
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
    _bulkOperationsRegistry: ExecutionBulkOperationsRegisterService,
  ) {
    _bulkOperationsRegistry.register();
    this.registerEntities();
    this.registerDashlets();
    this.registerRoutes();
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
      path: 'executions',
      canActivate: [executionGuard],
      canDeactivate: [executionDeactivateGuard],
      resolve: {
        executionParametersScreenData: preloadScreenDataResolver('executionParameters'),
      },
      component: ExecutionsComponent,
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
          matcher: (url) => {
            if (url[0].path === 'list' || url[0].path === 'open') {
              return null;
            }
            return { consumed: url };
          },
          component: ExecutionProgressComponent,
          children: [schedulePlanRoute('modal')],
        },
      ],
    });

    this._viewRegistry.registerRoute({
      path: 'alt-executions',
      component: AltExecutionsComponent,
      canActivate: [altExecutionGuard],
      resolve: {
        executionParametersScreenData: preloadScreenDataResolver('executionParameters'),
        forceActivateViewId: () => inject(NavigatorService).forceActivateView('executions'),
      },
      canDeactivate: [executionDeactivateGuard, () => inject(NavigatorService).cleanupActivateView()],
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
          path: ':id',
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
          ],
          canActivate: [
            (route: ActivatedRouteSnapshot) => {
              const id = route.params['id'];
              inject(ActiveExecutionContextService).setupExecutionId(id);
              return true;
            },
          ],
          children: [
            {
              path: '',
              redirectTo: 'report',
            },
            {
              path: 'report',
              data: {
                mode: ViewMode.VIEW,
              },
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
                {
                  path: '',
                  component: AltExecutionRangePickerComponent,
                  outlet: 'rangePicker',
                },
              ],
            },
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
                {
                  path: '',
                  component: AltExecutionRangePrintComponent,
                  outlet: 'rangePicker',
                },
              ],
            },
            {
              path: 'tree',
              children: [
                {
                  path: '',
                  component: AltExecutionTreeTabComponent,
                },
                {
                  path: '',
                  component: AltExecutionRangePickerComponent,
                  outlet: 'rangePicker',
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
                    const _state = inject(AGGREGATED_TREE_TAB_STATE);
                    const _queryParamNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
                    const aggregatedNodeId = route.queryParams[_queryParamNames.aggregatedNodeId];
                    if (!aggregatedNodeId) {
                      return undefined;
                    }
                    return _state.findNodeById(aggregatedNodeId);
                  },
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
}

export { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from './shared/type-leaf-report-nodes-table-params';
export { KeywordParameters } from './shared/keyword-parameters';
export * from './components/alt-execution-launch-dialog/alt-execution-launch-dialog.component';
export * from './services/scheduler-invoker.service';
