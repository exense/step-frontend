import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ExecutionsPanelsService } from '../../services/executions-panels.service';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution, ExecutionSummaryDto, ReportNode, SelectionCollector } from '@exense/step-core';
import { ExecutionStepPanel } from '../../shared/execution-step-panel';
import { ExecutionViewServices } from '../../../operations/shared/execution-view-services';

@Component({
  selector: 'step-execution-step',
  templateUrl: './execution-step.component.html',
  styleUrls: ['./execution-step.component.scss'],
})
export class ExecutionStepComponent implements OnChanges {
  @Input() eId: string = '';
  @Input() testCasesProgress?: ExecutionSummaryDto;
  @Input() execution?: Execution;
  @Input() stepsTable: any;
  @Input() stepsTableServerSideParameters: any;
  @Input() executionViewServices?: ExecutionViewServices;
  @Input() showTestCaseCurrentOperation?: boolean;

  @Input() testCases?: ReportNode[];

  @Input() testCasesSelection?: SelectionCollector<string, ReportNode>;

  @Output() drilldownTestCase = new EventEmitter<string>();

  showAllOperations: boolean = false;

  parameters: { key: string; value: string }[] = [];

  readonly ID_TEST_CASES = 'testCases';
  readonly ID_STEPS = 'steps';
  readonly ID_PARAMETERS = 'parameters';

  readonly panelTestCases?: ExecutionStepPanel;
  readonly panelSteps?: ExecutionStepPanel;
  readonly panelParameters?: ExecutionStepPanel;

  constructor(public panelService: ExecutionsPanelsService) {
    [this.panelTestCases, this.panelSteps, this.panelParameters] = [
      this.ID_TEST_CASES,
      this.ID_STEPS,
      this.ID_PARAMETERS,
    ].map((id) => panelService.getPanel(id));
  }

  chooseTestcase(testCase: ReportNode): void {
    this.drilldownTestCase.emit(testCase.artefactID);
  }

  selectAllTestCases(): void {
    this.testCasesSelection!.select(...this.testCases!);
  }

  unselectAllTestCases(): void {
    this.testCasesSelection!.clear();
  }

  ngOnChanges(changes: SimpleChanges) {
    const cExecution = changes['execution'];
    if (cExecution?.currentValue !== cExecution?.previousValue) {
      const paramsObject: Record<string, string> = cExecution?.currentValue?.parameters || {};
      this.parameters = Object.entries(paramsObject).map(([key, value]) => ({ key, value }));
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionStep', downgradeComponent({ component: ExecutionStepComponent }));
