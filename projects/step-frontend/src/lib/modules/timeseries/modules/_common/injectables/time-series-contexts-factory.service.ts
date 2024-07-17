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
  private storage: { [key: string]: TimeSeriesContext } = {};

  createContext(params: TimeSeriesContextParams, storageId?: string): TimeSeriesContext {
    if (storageId && this.storage[storageId]) {
      throw new Error('Execution already exists for id: ' + storageId);
    }
    let context = new TimeSeriesContext(params);
    if (storageId) {
      this.storage[storageId] = context;
    }
    return context;
  }

  getContext(storageId: string): TimeSeriesContext {
    if (!storageId) {
      throw new Error('Storage id must be specified!');
    }
    return this.storage[storageId];
  }

  destroyContext(id: string | undefined) {
    if (id === undefined) {
      return;
    }
    this.storage[id]?.destroy();
    delete this.storage[id];
  }
}
