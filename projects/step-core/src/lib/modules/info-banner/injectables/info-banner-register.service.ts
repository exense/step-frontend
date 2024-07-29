import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { getAdditionalConfig } from '../../basics/step-basics.module';
import { infoBannerActivate } from '../guards/info-banner.activate';
import { infoBannerDeactivate } from '../guards/info-banner.deactivate';

@Injectable({
  providedIn: 'root',
})
export class InfoBannerRegisterService {
  registerInfoBannerRoutes(route: Route): void {
    if (route.path) {
      this.registerRouteResolver(route, route.path);
    }

    const routesToProceed = [route];
    while (!!routesToProceed.length) {
      const current = routesToProceed.shift()!;
      const infoBannerKey = getAdditionalConfig(current)?.infoBannerKey;
      if (!!infoBannerKey) {
        this.registerRouteResolver(current, infoBannerKey);
      }

      if (!!current.children?.length) {
        routesToProceed.push(...current.children);
      }
    }
  }

  private registerRouteResolver(route: Route, infoBannerKey: string): void {
    route.canActivate = route.canActivate ?? [];
    route.canActivate.push(infoBannerActivate(infoBannerKey));

    route.canDeactivate = route.canDeactivate ?? [];
    route.canDeactivate.push(infoBannerDeactivate);
  }
}
