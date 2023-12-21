import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../modules/basics/services/auth.service';
import { routesPrioritySortPredicate, SUB_ROUTE_DATA, SubRouteData } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class CheckPermissionsGuard {
  private _auth = inject(AuthService);
  private _router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const data = route.data[SUB_ROUTE_DATA] as SubRouteData;
    if (!data?.accessPermissions?.length || this._auth.hasAnyRights(data.accessPermissions)) {
      return true;
    }

    const siblings = [...(route?.parent?.routeConfig?.children ?? [])]
      .filter((sibling) => !!sibling.path)
      .sort(routesPrioritySortPredicate);

    if (!siblings.length) {
      return false;
    }

    const routeIndex = siblings.indexOf(route.routeConfig!);
    const nextRoute = siblings[routeIndex + 1];
    if (!nextRoute) {
      return false;
    }

    const routeCommands = state.url.split('/');
    routeCommands[routeCommands.length - 1] = nextRoute.path!;

    return this._router.createUrlTree(routeCommands);
  }
}
