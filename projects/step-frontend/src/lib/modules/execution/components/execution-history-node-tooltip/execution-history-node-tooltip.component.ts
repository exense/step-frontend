import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormat } from '@exense/step-core';
import { ExecutionNodeItem } from '../execution-history-node/ExecutionNodeItem';

@Component({
  selector: 'step-execution-history-node-tooltip',
  templateUrl: './execution-history-node-tooltip.component.html',
  styleUrls: ['./execution-history-node-tooltip.component.scss'],
  standalone: false,
})
export class ExecutionHistoryNodeTooltipComponent {
  private _router = inject(Router);

  readonly node = input.required<ExecutionNodeItem>();

  protected navigateToExecution(): void {
    this._router.navigateByUrl(`/executions/${this.node().id}`);
  }

  protected readonly DateFormat = DateFormat;
}
