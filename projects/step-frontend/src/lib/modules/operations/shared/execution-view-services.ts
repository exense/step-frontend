import { Execution } from '@exense/step-core';

export interface ExecutionViewServices {
  showNodeInTree(nodeId: string): void;
  showTestCase(nodeId: string): void;
  getExecution(): Execution;
}
