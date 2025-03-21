import { Component, computed, input, Input } from '@angular/core';
import { Execution } from '@exense/step-core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'step-tooltip-executions-menu',
  templateUrl: './tooltip-executions-menu.component.html',
  styleUrls: ['./tooltip-executions-menu.component.scss'],
  standalone: true,
  imports: [MatProgressSpinner],
})
export class TooltipExecutionsMenuComponent {
  executions = input<Execution[] | null>(null);

  transformedExecutions = computed<ExecutionItem[] | null>(() => {
    let executions = this.executions();
    if (executions === undefined) {
      return null;
    }
    return executions!.map((e) => {
      const formattedDate = new Date(e.startTime!).toLocaleString();
      return {
        id: e.id!,
        name: e.description,
        formattedDate: formattedDate,
      } as ExecutionItem;
    });
  });

  navigateToExecution(executionId: string) {
    const url = `#/executions/${executionId}/viz`;
    window.open(url, '_blank');
  }
}

export interface ExecutionItem {
  id: string;
  name: string;
  formattedDate: string;
}
