import { Injectable } from '@angular/core';
import { ExecutionTabContext } from './execution-page/execution-tab-context';

@Injectable({
  providedIn: 'root',
})
export class ExecutionsPageService {
  // key is the executionId
  private executionsContexts: { [key: string]: ExecutionTabContext } = {};

  /**
   * The method will create the context if it doesn't exist yet.
   */
  getContext(executionId: string): ExecutionTabContext {
    if (!executionId) {
      throw new Error('Execution id must be specified!');
    }
    let context = this.executionsContexts[executionId];
    if (!context) {
      context = new ExecutionTabContext(executionId);
      this.executionsContexts[executionId] = context;
    }
    return context;
  }

  destroyContext(executionId: string) {
    delete this.executionsContexts[executionId];
  }
}
