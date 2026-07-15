import { Component, computed, input } from '@angular/core';
import { Execution } from '@exense/step-core';

type Status = Execution['status'];
type Result = Execution['result'];

@Component({
  selector: 'step-execution-result',
  templateUrl: './execution-result.component.html',
  styleUrls: ['./execution-result.component.scss'],
  standalone: false,
})
export class ExecutionResultComponent {
  readonly status = input<Status>();
  readonly result = input<Result>();

  protected readonly displayResult = computed(() => this.retrieveResult(this.status(), this.result()));
  protected readonly icon = computed(() => this.retrieveIcon(this.status(), this.result()));
  protected readonly statusClass = computed(() => {
    const result = this.result();
    return result ? `step-icon-${result}` : '';
  });

  private retrieveResult(status: Status | undefined, result: Result | undefined): string {
    if (!status && !result) {
      return '';
    }

    if (status && status !== 'ENDED') {
      return status;
    }

    return result || 'UNKNOW';
  }

  private retrieveIcon(status: Status | undefined, result: Result | undefined): string {
    if (!status && !result) {
      return '';
    }

    if (status && status !== 'ENDED') {
      return 'step-refresh';
    }

    if (result === 'PASSED') {
      return 'check-circle';
    }

    return 'alert-circle';
  }
}
