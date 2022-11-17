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
import { CustomCellRegistryService, EntityRegistry } from '@exense/step-core';
import { ExecutionErrorsComponent } from './components/execution-errors/execution-errors.component';
import { RepositoryPlanTestcaseListComponent } from './components/repository-plan-testcase-list/repository-plan-testcase-list.component';
import { ExecutionTreeComponent } from './components/execution-tree/execution-tree.component';

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
  ],
  imports: [StepCommonModule, OperationsModule, ReportNodesModule],
  exports: [
    ExecutionListComponent,
    ExecutionStepComponent,
    ExecutionTabsComponent,
    ExecutionErrorsComponent,
    KeywordCallsComponent,
    ExecutionTreeComponent,
  ],
})
export class ExecutionModule {
  constructor(_entityRegistry: EntityRegistry, _cellsRegister: CustomCellRegistryService) {
    _entityRegistry.register('executions', 'Execution', undefined, '/partials/executions/executionSelectionTable.html');
  }
}

export { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from './shared/type-leaf-report-nodes-table-params';
export { KeywordParameters } from './shared/keyword-parameters';
