import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { getAdditionalConfig } from '../types/step-route-additional-config';

@Injectable({
  providedIn: 'root',
})
export class QuickAccessRouteService {
  private routesDictionary = new Map<string, Route>();

  getRoute(alias: string): Route | undefined {
    return this.routesDictionary.get(alias);
  }

  registerQuickAccessRoutes(route: Route): void {
    const routesToProceed = [route];
    while (!!routesToProceed.length) {
      const current = routesToProceed.shift()!;
      const routeAdditionalConfig = getAdditionalConfig(current);
      if (!!routeAdditionalConfig?.quickAccessAlias) {
        this.routesDictionary.set(routeAdditionalConfig.quickAccessAlias, current);
        delete routeAdditionalConfig.quickAccessAlias;
      }

      if (!!current.children?.length) {
        routesToProceed.push(...current.children);
      }
    }
  }
}
