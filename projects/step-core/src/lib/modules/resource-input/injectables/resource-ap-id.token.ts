import { computed, inject, InjectionToken, Injector, Provider, runInInjectionContext, Signal } from '@angular/core';
import { IDE_MODE } from '../../basics/step-basics.module';

export const RESOURCE_AP_ID = new InjectionToken<Signal<string>>('Automation package id for resource');

type CustomFields = {
  customFields?: Record<string, any>;
};

const LOCAL = 'local';

export const provideResourceApId = <T extends CustomFields>(getEntity: () => Signal<T | undefined>): Provider => ({
  provide: RESOURCE_AP_ID,
  useFactory: () => {
    const _injector = inject(Injector);
    const _ideMode = inject(IDE_MODE);

    const entitySignal = runInInjectionContext(_injector, getEntity);

    return computed(() => {
      const entity = entitySignal();
      if (_ideMode) {
        return LOCAL;
      }
      return entity?.customFields?.['automationPackageId'];
    });
  },
});
