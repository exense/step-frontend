import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { Execution } from '@exense/step-core';

@Component({
  selector: 'step-execution-actions',
  templateUrl: './execution-actions.component.html',
  styleUrl: './execution-actions.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionActionsComponent {
  /** @Input() **/
  execution = input<Execution | undefined>();

  /** @Input() **/
  isExecutionIsolated = input(false);

  /** @Input() **/
  allowExecuteWithContent = input(false);

  /** @Output() **/
  execute = output<boolean>();

  /** @Output() **/
  schedule = output();

  /** @Output() **/
  stop = output();

  /** @Output() **/
  forceStop = output();

  /** @Output() **/
  copyLink = output();
}
