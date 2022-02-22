import { forwardRef, Injectable } from '@angular/core';
import { AJS_MODULE } from '../shared';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';

@Injectable({
  providedIn: 'root',
  useExisting: forwardRef(() => InvokeRunService),
})
export abstract class InvokeRunRegister {
  abstract registerRun(runBlock: () => void): void;
}

@Injectable({
  providedIn: 'root',
  useExisting: forwardRef(() => InvokeRunService),
})
export abstract class InvokeRunExecutor {
  abstract invoke(): void;
}

@Injectable({
  providedIn: 'root',
})
export class InvokeRunService implements InvokeRunRegister, InvokeRunExecutor {
  private _runBlocks: Array<() => void> = [];

  registerRun(runBlock: () => void): void {
    this._runBlocks.push(runBlock);
  }

  invoke(): void {
    this._runBlocks.forEach((run) => run());
    this._runBlocks = [];
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('invokeRunExecutor', downgradeInjectable(InvokeRunExecutor))
  .run([
    'invokeRunExecutor',
    (invokeRunExecutor: InvokeRunExecutor) => {
      invokeRunExecutor.invoke();
    },
  ]);
