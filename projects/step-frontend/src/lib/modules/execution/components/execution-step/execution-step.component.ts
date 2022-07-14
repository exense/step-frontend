import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ExecutionsPanelsService } from '../../services/executions-panels.service';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution, ExecutionSummaryDto, ReportNode, SelectionCollector } from '@exense/step-core';
import { ExecutionStepPanel } from '../../shared/execution-step-panel';

@Component({
  selector: 'step-execution-step',
  templateUrl: './execution-step.component.html',
  styleUrls: ['./execution-step.component.scss'],
})
export class ExecutionStepComponent implements OnInit, OnDestroy {
  @Input() eId: string = '';
  @Input() testCasesProgress?: ExecutionSummaryDto;
  @Input() execution?: Execution;

  @Input() testCases?: ReportNode[];

  @Input() testCasesSelection?: SelectionCollector<string, ReportNode>;

  @Output() drilldownTestCase = new EventEmitter<string>();

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

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionStep', downgradeComponent({ component: ExecutionStepComponent }));
