import { FactoryProvider, InjectionToken } from '@angular/core';

export const INJECTOR = '$injector';

export function ajsProvider(provide: InjectionToken<any>, useFactory: Function): FactoryProvider {
  const deps = [INJECTOR];
  return {
    provide,
    useFactory,
    deps,
  };
}

export const AJS_ROOT_SCOPE: InjectionToken<any> = new InjectionToken<any>('$rootScope');
export const AJS_LOCATION: InjectionToken<any> = new InjectionToken<any>('$location');
export const AJS_PREFERENCES: InjectionToken<any> = new InjectionToken<any>('Preferences');
export const AJS_UIB_MODAL: InjectionToken<any> = new InjectionToken<any>('$uibModal');

export const AJS_PROVIDERS = [
  ajsProvider(AJS_ROOT_SCOPE, ($injector: any) => $injector.get('$rootScope')),
  ajsProvider(AJS_LOCATION, ($injector: any) => $injector.get('$location')),
  ajsProvider(AJS_PREFERENCES, ($injector: any) => $injector.get('Preferences')),
  ajsProvider(AJS_UIB_MODAL, ($injector: any) => $injector.get('$uibModal')),
];
