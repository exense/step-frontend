import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { ROUTE_ALIAS } from '../types/quick-access-route';

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
      const alias = (current as any)[ROUTE_ALIAS];
      if (!!alias) {
        delete (current as any)[ROUTE_ALIAS];
        this.routesDictionary.set(alias, current);
      }

      if (!!current.children?.length) {
        routesToProceed.push(...current.children);
      }
    }
  }
}
