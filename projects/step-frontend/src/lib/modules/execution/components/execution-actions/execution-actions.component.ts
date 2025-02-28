import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { Execution } from '@exense/step-core';

const DEFAULT_TOOLTIPS = {
  simulate: 'Simulate execution',
  execute: 'New execution',
  executeWithParams: 'New execution with parameters',
  schedule: 'Schedule',
  stop: 'Stop',
  forceStop: 'Force stop',
  link: 'Copy start request as curl command to clipboard',
};

export type ExecutionActionsTooltips = Partial<typeof DEFAULT_TOOLTIPS>;

@Component({
  selector: 'step-execution-actions',
  templateUrl: './execution-actions.component.html',
  styleUrl: './execution-actions.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionActionsComponent {
  /** @Input() **/
  readonly execution = input<Execution | undefined>();

  /** @Input() **/
  readonly isExecutionIsolated = input(false);

  /** @Input() **/
  readonly allowExecuteWithContent = input(false);

  /** @Input() **/
  readonly externalTooltips = input<ExecutionActionsTooltips | undefined>(undefined, { alias: 'tooltips' });

  protected readonly tooltips = computed<typeof DEFAULT_TOOLTIPS>(() => {
    const externalTooltips = this.externalTooltips() ?? {};
    return { ...DEFAULT_TOOLTIPS, ...externalTooltips };
  });

  /** @Output() **/
  readonly execute = output<boolean>();

  /** @Output() **/
  readonly schedule = output();

  /** @Output() **/
  readonly stop = output();

  /** @Output() **/
  readonly forceStop = output();

  /** @Output() **/
  readonly copyLink = output();
}
