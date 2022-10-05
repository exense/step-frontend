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
import { ExecutionItemsSubtabsComponent } from './components/execution-item-subtabs/execution-items-subtabs.component';
import { ExecutionsTabsControlService } from './services/executions-tabs-control.service';

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
    ExecutionItemsSubtabsComponent,
  ],
  imports: [StepCommonModule, OperationsModule, ReportNodesModule],
  exports: [ExecutionListComponent, ExecutionStepComponent, ExecutionTabsComponent, ExecutionItemsSubtabsComponent],
  providers: [ExecutionsTabsControlService],
})
export class ExecutionModule {
  constructor(_entityRegistry: EntityRegistry, _cellsRegister: CustomCellRegistryService) {
    _entityRegistry.register('executions', 'Execution', undefined, '/partials/executions/executionSelectionTable.html');
  }
}
