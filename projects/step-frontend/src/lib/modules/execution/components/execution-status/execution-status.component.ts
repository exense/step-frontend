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
  /** @Input() **/
  execution = input<Execution | undefined>();

  status = computed<DisplayStatus>(() => {
    const { status, result } = this.execution() ?? { status: undefined, result: undefined };
    if (status !== 'ENDED') {
      return status;
    }
    return result;
  });
}
