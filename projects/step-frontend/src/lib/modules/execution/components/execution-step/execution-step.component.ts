import { Component, Input, OnInit } from '@angular/core';
import { ExecutionsPanelsService } from '../../services/executions-panels.service';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution, ExecutionSummaryDto } from '@exense/step-core';
import { ExecutionStepPanel } from '../../shared/execution-step-panel';

@Component({
  selector: 'step-execution-step',
  templateUrl: './execution-step.component.html',
  styleUrls: ['./execution-step.component.scss'],
})
export class ExecutionStepComponent implements OnInit {
  @Input() eId: string = '';
  @Input() testCasesProgress?: ExecutionSummaryDto;
  @Input() execution?: Execution;

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

  ngOnInit(): void {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionStep', downgradeComponent({ component: ExecutionStepComponent }));
