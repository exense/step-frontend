import { Injectable } from '@angular/core';
import { TimeSeriesContext } from './time-series-context';
import { TSTimeRange } from './chart/model/ts-time-range';

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

  createContext(id: string, fullTimeRange: TSTimeRange) {
    if (this.executionsContexts[id]) {
      throw new Error('Execution already exists for id: ' + id);
    }
    let context = new TimeSeriesContext(id, fullTimeRange);
    this.executionsContexts[id] = context;
    return context;
  }

  /**
   * The method will create a new context if it doesn't exist yet.
   */
  getContext(contextId: string): TimeSeriesContext {
    if (!contextId) {
      throw new Error('Context id must be specified!');
    }
    return this.executionsContexts[contextId];
  }

  destroyContext(executionId: string) {
    delete this.executionsContexts[executionId];
  }
}
