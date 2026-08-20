import { computed, inject, InjectionToken, Injector, Provider, runInInjectionContext, Signal } from '@angular/core';

export const RESOURCE_AP_ID = new InjectionToken<Signal<string>>('Automation package id for resource');

type CustomFields = {
  customFields?: Record<string, any>;
};

export const provideResourceApId = <T extends CustomFields>(getEntity: () => Signal<T | undefined>): Provider => ({
  provide: RESOURCE_AP_ID,
  useFactory: () => {
    const _injector = inject(Injector);
    const entitySignal = runInInjectionContext(_injector, getEntity);
    return computed(() => {
      const entity = entitySignal();
      return entity?.customFields?.['automationPackageId'];
    });
  },
});
