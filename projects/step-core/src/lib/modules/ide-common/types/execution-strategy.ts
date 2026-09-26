import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionCommandsContext } from './execution-commands-context.interface';

export interface ExecutionActionAvailability {
  readonly execute: boolean;
  readonly simulate: boolean;
  readonly copyRequest: boolean;
  readonly schedule: boolean;
}

export const ALL_EXECUTION_ACTIONS_AVAILABLE: ExecutionActionAvailability = {
  execute: true,
  simulate: true,
  copyRequest: true,
  schedule: true,
};

export type ExecutionLaunchResult = { kind: 'LOCAL'; executionId: string } | { kind: 'HANDLED' };

export interface ExecutionStrategy {
  readonly availability: Signal<ExecutionActionAvailability>;
  readonly showTestcases: Signal<boolean>;

  execute(context: ExecutionCommandsContext, options: { simulate: boolean }): Observable<ExecutionLaunchResult>;
}
