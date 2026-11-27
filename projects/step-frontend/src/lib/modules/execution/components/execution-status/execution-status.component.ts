import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { Execution } from '@exense/step-core';

type DisplayStatus = Execution['status'] | Execution['result'] | undefined;

@Component({
  selector: 'step-execution-status',
  templateUrl: './execution-status.component.html',
  styleUrl: './execution-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExecutionStatusComponent {
  readonly execution = input<Execution | undefined>();

  protected readonly status = computed<DisplayStatus>(() => {
    const { status, result } = this.execution() ?? { status: undefined, result: undefined };
    if (status !== 'ENDED') {
      return status;
    }
    return result;
  });

  protected readonly interruptionReason = computed(() => {
    const execution = this.execution();
    const status = this.status();
    const description: unknown = execution?.customFields?.['description'];
    return status === 'INTERRUPTED' && typeof description === 'string' && description.trim() ? description : undefined;
  });
}
