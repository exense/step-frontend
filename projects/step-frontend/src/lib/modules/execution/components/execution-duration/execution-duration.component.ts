import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { DateFormat, Execution } from '@exense/step-core';

@Component({
  selector: 'step-execution-duration',
  templateUrl: './execution-duration.component.html',
  styleUrl: './execution-duration.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExecutionDurationComponent {
  protected readonly DateFormat = DateFormat;

  /** @Input() **/
  readonly execution = input<Execution>();

  readonly isRunning = computed(() => this.execution()?.status === 'RUNNING');

  readonly endTime = computed(() => this.execution()?.endTime ?? new Date().getTime());
}
