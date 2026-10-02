import { Signal } from '@angular/core';
import { ExecutionStrategy } from './execution-strategy';

export interface ExecutionStrategyController {
  readonly selectedStrategy: Signal<ExecutionStrategy>;
  selectStrategy(strategy: ExecutionStrategy): void;
  restoreLocalStrategy(): void;
}
