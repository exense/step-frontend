import { inject, InjectionToken, Injector } from '@angular/core';
import { IRootScopeService } from 'angular';

export const HYBRID_INJECTOR_HELPER = new InjectionToken<Injector>('Injector for modal windows with hybrid content', {
  providedIn: 'root',
  factory: () => {
    const injector = inject(Injector);
    //@ts-ignore
    const $rootScope = inject<IRootScopeService>('$rootScope');
    const result = Injector.create(
      [
        {
          provide: '$scope',
          useFactory: () => $rootScope.$new(),
        },
      ],
      injector
    );
    return result;
  },
});
