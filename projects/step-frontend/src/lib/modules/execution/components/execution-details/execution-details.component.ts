import { Component, input } from '@angular/core';
import { Execution } from '@exense/step-core';

@Component({
  selector: 'step-execution-details',
  templateUrl: './execution-details.component.html',
  styleUrl: './execution-details.component.scss',
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
  execution = input<Execution>();
}
