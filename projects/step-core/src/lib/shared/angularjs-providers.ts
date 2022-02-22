import { InjectionToken } from '@angular/core';
import { angularJsProviderOptions } from './angularjs-provider-options';
import { ILocationService, IRootScopeService, ITemplateCacheService } from 'angular';

export const AJS_ROOT_SCOPE = new InjectionToken<IRootScopeService>(
  '$rootScope',
  angularJsProviderOptions('$rootScope')
);
export const AJS_LOCATION = new InjectionToken<ILocationService>('$location', angularJsProviderOptions('$location'));
export const AJS_PREFERENCES = new InjectionToken<any>('Preferences', angularJsProviderOptions('Preferences'));
export const AJS_UIB_MODAL = new InjectionToken<any>('$uibModal', angularJsProviderOptions('$uibModal'));
export const AJS_TEMPLATES_CACHE = new InjectionToken<ITemplateCacheService>(
  '$templateCache',
  angularJsProviderOptions('$templateCache')
);
