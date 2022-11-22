import { Injectable } from '@angular/core';
import { TimeSeriesContext } from './execution-page/time-series-context';

/**
 * This is a singleton which handles all contexts for the execution tabs.
 * Each tab will have one 'ExecutionTabContext', where we store things about the execution, like time-selection, filters, used colors, etc.
 */
@Injectable({
  providedIn: 'root',
})
export class TimeSeriesContextsFactory {
  // key is the executionId
  private executionsContexts: { [key: string]: TimeSeriesContext } = {};

  /**
   * The method will create a new context if it doesn't exist yet.
   */
  getContext(contextId: string): TimeSeriesContext {
    if (!contextId) {
      throw new Error('Context id must be specified!');
    }
    let context = this.executionsContexts[contextId];
    if (!context) {
      context = new TimeSeriesContext(contextId);
      this.executionsContexts[contextId] = context;
    }
    return context;
  }

  destroyContext(executionId: string) {
    delete this.executionsContexts[executionId];
  }
}
