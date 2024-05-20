import { NgModule } from '@angular/core';
import { ExecutionListComponent } from './components/execution-list/execution-list.component';
import { StepCommonModule } from '../_common/step-common.module';
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
import { DashletRegistryService, EntityRegistry, schedulePlanRoute, ViewRegistryService } from '@exense/step-core';
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
import { AltExecutionsComponent } from './components/alt-executions/alt-executions.component';
import { AltExecutionProgressComponent } from './components/alt-execution-progress/alt-execution-progress.component';
import { AltExecutionReportComponent } from './components/alt-execution-report/alt-execution-report.component';
import { AltExecutionAnalyticsComponent } from './components/alt-execution-analytics/alt-execution-analytics.component';
import { AltReportNodeSummaryComponent } from './components/alt-keywords-summary/alt-report-node-summary.component';
import { AltReportNodeListComponent } from './components/alt-report-node-list/alt-report-node-list.component';
import { AltStatusComponent } from './components/alt-status/alt-status.component';
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
import { AltExecutionTreeComponent } from './components/alt-execution-tree/alt-execution-tree.component';

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
    AltExecutionsComponent,
    AltExecutionsComponent,
    AltExecutionProgressComponent,
    AltExecutionReportComponent,
    AltExecutionAnalyticsComponent,
    AltReportNodeSummaryComponent,
    AltReportNodeListComponent,
    AltExecutionTimeComponent,
    AltStatusComponent,
    AltReportPerformanceOverviewChartComponent,
    AltReportCurrentOperationsComponent,
    AltReportWidgetComponent,
    AltReportWidgetFilterDirective,
    AltReportWidgetContentDirective,
    AltReportNodeKeywordsComponent,
    AltReportNodesTestcasesComponent,
    AltExecutionTreeComponent,
    ExecutionDetailsComponent,
    AggregatedTreeStatusComponent,
    AppliedStatusPipe,
  ],
  imports: [StepCommonModule, OperationsModule, ReportNodesModule, TimeSeriesModule],
  exports: [
    ExecutionListComponent,
    ExecutionStepComponent,
    ExecutionTabsComponent,
    ExecutionErrorsComponent,
    KeywordCallsComponent,
    ExecutionTreeComponent,
    ExecutionCommandsComponent,
    ExecutionProgressComponent,
    RepositoryComponent,
    ExecutionSelectionTableComponent,
    StatusComponent,
    AltExecutionsComponent,
    AltExecutionProgressComponent,
    AltExecutionReportComponent,
    AltExecutionAnalyticsComponent,
    AltExecutionTreeComponent,
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
    this._viewRegistry.registerRoute({
      path: 'repository',
      component: RepositoryComponent,
      children: [schedulePlanRoute()],
    });

    this._viewRegistry.registerRoute({
      path: 'executions',
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
          children: [
            {
              path: '',
              redirectTo: 'report',
            },
            {
              path: 'report',
              component: AltExecutionReportComponent,
            },
            {
              path: 'tree',
              component: AltExecutionTreeComponent,
            },
            {
              path: 'analytics',
              component: AltExecutionAnalyticsComponent,
            },
            schedulePlanRoute('modal'),
          ],
        },
      ],
    });
  }
}

export { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from './shared/type-leaf-report-nodes-table-params';
export { KeywordParameters } from './shared/keyword-parameters';
