import { Component, computed, input } from '@angular/core';
import { Execution } from '@exense/step-core';

@Component({
  selector: 'step-execution-details',
  templateUrl: './execution-details.component.html',
  styleUrl: './execution-details.component.scss',
  standalone: false,
})
export class ExecutionDetailsComponent {
  /** @Input() **/
  showStatus = input(false);

  /** @Input() **/
  showPlan = input(true);

  /** @Input() **/
  showMode = input(true);

  /** @Input() **/
  showUser = input(true);

  /** @Input() **/
  showExecutionId = input(true);

  /** @Input() **/
  showDates = input(true);

  /** @Input() **/
  execution = input<Execution>();

  protected status = computed(() => {
    const execution = this.execution();
    return execution?.status === 'ENDED' ? execution?.result : execution?.status;
  });
}
