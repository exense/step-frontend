import { InjectionToken } from '@angular/core';
import { angularJsProviderOptions } from '../modules/basics/step-basics.module';
import { IRootScopeService } from 'angular';

export const AJS_ROOT_SCOPE = new InjectionToken<IRootScopeService>(
  '$rootScope',
  angularJsProviderOptions('$rootScope')
);
export const AJS_PREFERENCES = new InjectionToken<any>('Preferences', angularJsProviderOptions('Preferences'));
export const AJS_UIB_MODAL = new InjectionToken<any>('$uibModal', angularJsProviderOptions('$uibModal'));
