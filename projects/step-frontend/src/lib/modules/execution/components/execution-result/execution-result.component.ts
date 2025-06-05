import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Execution } from '@exense/step-core';

type Status = Execution['status'];
type Result = Execution['result'];

@Component({
  selector: 'step-execution-result',
  templateUrl: './execution-result.component.html',
  styleUrls: ['./execution-result.component.scss'],
  standalone: false,
})
export class ExecutionResultComponent implements OnChanges {
  @Input() status?: Status;
  @Input() result?: Result;

  displayResult: string = '';
  icon: string = '';
  statusClass: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    let status: Status | undefined;
    let result: Result | undefined;

    const cStatus = changes['status'];
    const cResult = changes['result'];

    if (cStatus?.previousValue !== cStatus?.currentValue || cStatus?.firstChange) {
      status = cStatus?.currentValue;
    }

    if (cResult?.previousValue !== cResult?.currentValue || cResult?.firstChange) {
      result = cResult?.currentValue;
      this.statusClass = result ? `step-icon-${result}` : '';
    }

    if (result || status) {
      this.icon = this.retrieveIcon(status, result);
      this.displayResult = this.retrieveResult(status, result);
    }
  }

  private retrieveResult(status?: Status, result?: Result): string {
    status = status || this.status;
    result = result || this.result;

    if (!status && !result) {
      return '';
    }

    if (status !== 'ENDED') {
      return status!;
    }

    return result || 'UNKNOW';
  }

  private retrieveIcon(status?: Status, result?: Result): string {
    status = status || this.status;
    result = result || this.result;

    if (!status && !result) {
      return '';
    }

    if (status !== 'ENDED') {
      return 'refresh-cw';
    }

    if (result === 'PASSED') {
      return 'check-circle';
    }

    return 'alert-circle';
  }
}
