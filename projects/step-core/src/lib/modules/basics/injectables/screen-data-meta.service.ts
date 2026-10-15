import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Route } from '@angular/router';

const SCREEN_META = Symbol('screen-data-meta');

type ScreenRouteConfig = Route & { [SCREEN_META]?: Set<string> };

@Injectable({
  providedIn: 'root',
})
export class ScreenDataMetaService {
  addMetaInformationAboutScreenToRoute(screen: string, route: ActivatedRoute | ActivatedRouteSnapshot): void {
    const config = route.routeConfig as ScreenRouteConfig | null;
    if (!config) {
      return;
    }
    if (!config[SCREEN_META]) {
      config[SCREEN_META] = new Set<string>();
    }
    config[SCREEN_META].add(screen);
  }

  checkMetaInformationAboutScreenInRoute(screen: string, route: ActivatedRoute | ActivatedRouteSnapshot): void {
    const routeWithContext = this.resolveRouteContext(route);
    let routeToCheck: ActivatedRoute | ActivatedRouteSnapshot | null | undefined = routeWithContext;
    while (routeToCheck) {
      const meta = (routeToCheck.routeConfig as ScreenRouteConfig | null)?.[SCREEN_META];
      if (meta?.has(screen)) {
        return;
      }

      routeToCheck = routeToCheck.parent;
    }
    const path = routeWithContext.pathFromRoot
      .map((item) => item.routeConfig?.path ?? '')
      .filter((item) => !!item)
      .join('/');

    console.warn(`No screen "${screen}" resolver found for route ${path}.`);
  }

  private resolveRouteContext(route: ActivatedRoute | ActivatedRouteSnapshot): ActivatedRoute | ActivatedRouteSnapshot {
    if (route.routeConfig) {
      return route;
    }

    let activeRoute = route;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }
    return activeRoute;
  }
}
