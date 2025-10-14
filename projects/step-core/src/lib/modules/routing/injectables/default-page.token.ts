import { inject, InjectionToken } from '@angular/core';
import { AppConfigContainerService } from '../../../client/step-client-module';

export const DEFAULT_PAGE = new InjectionToken<(forceClientUrl?: boolean) => string>('Default page', {
  providedIn: 'root',
  factory: () => {
    const appConfigContainer = inject(AppConfigContainerService);
    return (forceClientUrl?: boolean) => appConfigContainer.getDefaultUrl(forceClientUrl);
  },
});
