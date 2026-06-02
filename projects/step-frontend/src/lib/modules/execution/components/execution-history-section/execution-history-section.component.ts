import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { HashContainer } from '../aggregated-tree-node-history/aggregated-tree-node-history.component';

@Component({
  selector: 'step-execution-history-section',
  templateUrl: './execution-history-section.component.html',
  styleUrl: './execution-history-section.component.scss',
  standalone: false,
})
export class ExecutionHistorySectionComponent {
  private _executionState = inject(AltExecutionStateService);

  readonly artefactHashContainer = input.required<HashContainer>();
  readonly previousExecutionsCount = input(8);

  protected readonly isScheduledExecution = toSignal(
    this._executionState.execution$.pipe(map((ex) => !!ex.executionTaskID)),
  );
}
