import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormat, Execution, STATUS_COLORS, StepBasicsModule } from '@exense/step-core';
import {Status} from "../../../_common/shared/status.enum";
import { ExecutionNode } from '../execution-history-node/execution-history-nodes.component';

@Component({
  selector: 'step-execution-history-node-tooltip',
  templateUrl: './execution-history-node-tooltip.component.html',
  styleUrls: ['./execution-history-node-tooltip.component.scss'],
  standalone: false,
})
export class ExecutionHistoryNodeTooltipComponent {
  private _router = inject(Router);

  readonly node = input.required<ExecutionNode>();

  protected navigateToExecution(): void {
    this._router.navigateByUrl(`/executions/${this.node().id}`);
  }

  protected readonly DateFormat = DateFormat;
}
