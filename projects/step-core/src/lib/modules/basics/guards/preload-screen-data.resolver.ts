import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { AugmentedScreenService } from '../../../client/step-client-module';
import { ScreenDataMetaService } from '../injectables/screen-data-meta.service';

export const preloadScreenDataResolver =
  (screen: string): ResolveFn<unknown> =>
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const screensApi = inject(AugmentedScreenService);
    const screenDataMeta = inject(ScreenDataMetaService);

    screenDataMeta.addMetaInformationAboutScreenToRoute(screen, route);
    return screensApi.getScreenInputsByScreenIdWithCache(screen);
  };
