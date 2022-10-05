import { Injectable } from '@angular/core';
import { AJS_MODULE } from '@exense/step-core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { Subject } from 'rxjs';

export enum ExecutionTabsCommandType {
  DISABLE,
  ENABLE,
}

export type ExecutionTabsCommand = {
  command: ExecutionTabsCommandType;
  executionId: string;
  id: string;
};

@Injectable({
  providedIn: 'root',
})
export class ExecutionsTabsControlService {
  readonly controlSubject$: Subject<ExecutionTabsCommand> = new Subject<ExecutionTabsCommand>();

  /**
   * disables first tab of the given id of executionId
   * @param label
   */
  disableTab(executionId: string, id: string): void {
    this.controlSubject$.next({
      command: ExecutionTabsCommandType.DISABLE,
      executionId: executionId,
      id: id,
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('executionsTabsControlService', downgradeInjectable(ExecutionsTabsControlService));
