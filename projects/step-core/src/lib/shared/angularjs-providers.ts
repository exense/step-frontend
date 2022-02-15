import { InjectionToken } from '@angular/core';
import { angularJsProviderOptions } from './angularjs-provider-options';

export const AJS_ROOT_SCOPE = new InjectionToken<any>('$rootScope', angularJsProviderOptions('$rootScope'));
export const AJS_LOCATION = new InjectionToken<any>('$location', angularJsProviderOptions('$location'));
export const AJS_PREFERENCES = new InjectionToken<any>('Preferences', angularJsProviderOptions('Preferences'));
export const AJS_UIB_MODAL = new InjectionToken<any>('$uibModal', angularJsProviderOptions('$uibModal'));
