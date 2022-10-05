import { Injectable, OnDestroy } from '@angular/core';
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

@Injectable()
export class ExecutionsTabsControlService implements OnDestroy {
  private commandSubject$: Subject<ExecutionTabsCommand> = new Subject<ExecutionTabsCommand>();
  readonly command$ = this.commandSubject$.asObservable();

  /**
   * disables first tab of the given id of executionId
   * @param label
   */
  disableTab(executionId: string, id: string): void {
    console.log('HELLO ');
    this.commandSubject$.next({
      command: ExecutionTabsCommandType.DISABLE,
      executionId: executionId,
      id: id,
    });
  }

  ngOnDestroy(): void {
    this.commandSubject$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('executionsTabsControlService', downgradeInjectable(ExecutionsTabsControlService));
