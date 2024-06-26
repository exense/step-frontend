import { Injectable } from '@angular/core';
import { TimeSeriesContext } from '../types/time-series/time-series-context';
import { TimeSeriesContextParams } from '../types/time-series/time-series-context-params';

/**
 * This is a singleton which handles all contexts for the execution tabs.
 * Each tab will have one 'ExecutionTabContext', where we store things about the execution, like time-selection, filters, used colors, etc.
 */
@Injectable({
  providedIn: 'root',
})
export class TimeSeriesContextsFactory {
  private executionsContexts: { [key: string]: TimeSeriesContext } = {};

  createContext(params: TimeSeriesContextParams): TimeSeriesContext {
    const id = params.id;
    if (this.executionsContexts[id]) {
      throw new Error('Execution already exists for id: ' + id);
    }
    let context = new TimeSeriesContext(params);
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

  destroyContext(id: string | undefined) {
    if (id === undefined) {
      return;
    }
    this.executionsContexts[id]?.destroy();
    delete this.executionsContexts[id];
  }
}
