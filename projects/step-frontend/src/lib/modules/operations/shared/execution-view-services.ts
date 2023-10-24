import { Execution } from '@exense/step-core';

export abstract class ExecutionViewServices {
  abstract showNodeInTree(nodeId: string): void;
  abstract showTestCase(nodeId: string): void;
}
