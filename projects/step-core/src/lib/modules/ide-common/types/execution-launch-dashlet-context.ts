import { Signal } from '@angular/core';
import { ExecutionStrategyController } from './execution-strategy-controller.interface';

export interface ExecutionLaunchDashletContext {
  readonly commands: ExecutionStrategyController;
  readonly allowExecutionTargetSelection: boolean;
  readonly planName: Signal<string | undefined>;
  readonly ready: Signal<boolean>;
}
