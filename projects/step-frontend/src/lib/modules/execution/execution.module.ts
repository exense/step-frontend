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
import {
  CustomCellRegistryService,
  DashletRegistryService,
  EntityRegistry,
  ViewRegistryService,
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
import { ExecutionPageComponent } from './components/execution-page/execution-page.component';
import { ExecutionSelectionTableComponent } from './components/execution-selection-table/execution-selection-table.component';

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
    ExecutionPageComponent,
    ExecutionSelectionTableComponent,
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
    ExecutionPageComponent,
    ExecutionSelectionTableComponent
  ],
})
export class ExecutionModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellsRegister: CustomCellRegistryService,
    _dashletRegistry: DashletRegistryService,
    _viewRegistry: ViewRegistryService
  ) {
    _entityRegistry.register('executions', 'Execution', undefined, ExecutionSelectionTableComponent);
    _dashletRegistry.registerDashlet('executionStep', DashletExecutionStepComponent);
    _dashletRegistry.registerDashlet('executionTree', DashletExecutionTreeComponent);
    _dashletRegistry.registerDashlet('executionViz', DashletExecutionVizComponent);
    _dashletRegistry.registerDashlet('executionError', DashletExecutionErrorsComponent);

    _viewRegistry.registerDashletAdvanced(
      'executionTabMigrated',
      'Execution steps',
      'executionStep',
      'steps',
      0,
      () => true
    );

    _viewRegistry.registerDashletAdvanced(
      'executionTabMigrated',
      'Execution tree',
      'executionTree',
      'tree',
      1,
      function () {
        return true;
      }
    );

    _viewRegistry.registerDashletAdvanced('executionTabMigrated', 'Performance', 'executionViz', 'viz', 2, function () {
      return true;
    });

    _viewRegistry.registerDashletAdvanced('executionTabMigrated', 'Errors', 'executionError', 'errors', 3, function () {
      return true;
    });
  }
}

export { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from './shared/type-leaf-report-nodes-table-params';
export { KeywordParameters } from './shared/keyword-parameters';
