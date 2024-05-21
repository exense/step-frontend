import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

const SCREEN_META = Symbol('screen-data-meta');

@Injectable({
  providedIn: 'root',
})
export class ScreenDataMetaService {
  addMetaInformationAboutScreenToRoute(screen: string, route: ActivatedRoute | ActivatedRouteSnapshot): void {
    const config = route.routeConfig as any;
    if (!config) {
      return;
    }
    if (!config[SCREEN_META]) {
      config[SCREEN_META] = new Set<string>();
    }
    (config[SCREEN_META] as Set<string>).add(screen);
  }

  checkMetaInformationAboutScreenInRoute(screen: string, route: ActivatedRoute | ActivatedRouteSnapshot): void {
    let routeToCheck: ActivatedRoute | ActivatedRouteSnapshot | null | undefined = route;
    while (routeToCheck) {
      const meta = (routeToCheck.routeConfig as any)?.[SCREEN_META] as Set<string> | undefined;
      if (meta?.has(screen)) {
        return;
      }

      routeToCheck = routeToCheck.parent;
    }
    const path = route.pathFromRoot
      .map((item) => item.routeConfig?.path ?? '')
      .filter((item) => !!item)
      .join('/');

    console.warn(`No screen "${screen}" resolver found for route ${path}.`);
  }
}
