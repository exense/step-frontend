import { Inject, Injectable } from '@angular/core';
import { AJS_MODULE, AJS_UIB_MODAL } from '../shared';
import { IScope } from 'angular';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';

export abstract class UibModalInstance {
  abstract close(data: any): void;
  abstract dismiss(reason?: string): void;
}

@Injectable({
  providedIn: 'root',
})
export class UibModalHelperService {
  constructor(@Inject(AJS_UIB_MODAL) private _$uibModal: any) {}

  open(modalOptions: any = {}): any {
    const options = {
      ...modalOptions,
      ...{
        controller: [
          '$scope',
          '$uibModalInstance',
          ($scope: IScope, modalInstance: any) => {
            ($scope as any).modalInstance = modalInstance;
          },
        ],
      },
    };
    return this._$uibModal.open(options);
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('uibModalHelperService', downgradeInjectable(UibModalHelperService));
