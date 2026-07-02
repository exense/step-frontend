import {effect, inject, Injectable, signal} from '@angular/core';
import {ApStorageService} from './ap-storage.service';
import {AutomationPackageDescriptor} from '@exense/step-core';

const LIMIT = 10;

@Injectable({
  providedIn: 'root'
})
export class ApAccessHistoryService {

  private _apStorage = inject(ApStorageService);

  private readonly historyInternal = signal(this.getHistory());
  readonly history = this.historyInternal.asReadonly();

  private effectHistoryChange = effect(() => {
    const history = this.history();
    this.saveHistory(history);
  });

  addToHistory(automationPackage: AutomationPackageDescriptor): void {
    this.historyInternal.update((history) => {
      const sameFolderIndex = history.findIndex((item) => item.directory === automationPackage.directory);
      if (sameFolderIndex !== -1) {
        history.splice(sameFolderIndex, 1);
      }
      history = [automationPackage, ...history];
      if (history.length > LIMIT) {
        history = history.slice(0, LIMIT);
      }
      return history;
    });
  }

  private saveHistory(history: AutomationPackageDescriptor[]): void {
    const json  = JSON.stringify(history);
    this._apStorage.setItem('history', json);
  }

  private getHistory(): AutomationPackageDescriptor[] {
    let result: AutomationPackageDescriptor[] = [];
    const historyJson = this._apStorage.getItem('history');

    if (!historyJson) {
      return result;
    }

    try {
      result = JSON.parse(historyJson) as AutomationPackageDescriptor[];
    } catch (e) {
      console.log(e);
    }

    return result;
  }
}
