import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface ExecutionResultInfo {
  status: string;
  result: string;
}

@Component({
  selector: 'step-execution-result',
  templateUrl: './execution-result.component.html',
  styleUrls: ['./execution-result.component.scss'],
})
export class ExecutionResultComponent implements OnChanges {
  @Input() execution?: ExecutionResultInfo;

  result: string = '';
  icon: string = '';
  statusClass: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const cExecution = changes['execution'];
    if (cExecution?.currentValue === cExecution?.previousValue) {
      return;
    }
    this.icon = this.restreiveIcon(cExecution?.currentValue);
    this.result = this.retreiveResult(cExecution?.currentValue);
    this.statusClass = this.result ? `step-icon-${this.result}` : '';
  }

  private retreiveResult(execution?: ExecutionResultInfo): string {
    if (!execution) {
      return '';
    }

    if (execution.status !== 'ENDED') {
      return execution.status;
    }

    return execution.result || 'UNKNOW';
  }

  private restreiveIcon(execution?: ExecutionResultInfo): string {
    if (!execution) {
      return '';
    }

    if (execution.status !== 'ENDED') {
      return 'autorenew';
    }

    if (execution.result === 'PASSED') {
      return 'check_circle';
    }

    return 'error';
  }
}
