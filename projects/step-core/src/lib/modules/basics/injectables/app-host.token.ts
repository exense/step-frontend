import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { AppConfigContainerService } from './app-config-container.service';

export const APP_HOST = new InjectionToken<string>('Application host', {
  providedIn: 'root',
  factory: () => {
    const _doc = inject(DOCUMENT);
    const _appConf = inject(AppConfigContainerService);
    const _ngLocation = inject(Location);
    const { location } = _doc.defaultView as Window;
    const mainHost = `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;
    const contextRoot = _appConf?.conf?.contextRoot ?? '';

    const result = [_ngLocation.normalize(mainHost), _ngLocation.normalize(contextRoot)].join('/');
    return _ngLocation.normalize(result);
  },
});
