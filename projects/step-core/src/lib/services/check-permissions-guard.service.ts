import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../modules/basics/services/auth.service';
import { routesPrioritySortPredicate, SUB_ROUTE_DATA, SubRouteData } from '../shared';

export const checkPermissionsGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const _auth = inject(AuthService);
  const _router = inject(Router);

  const data = route.data[SUB_ROUTE_DATA] as SubRouteData;
  if (!data?.accessPermissions?.length || _auth.hasAnyRights(data.accessPermissions)) {
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

  return _router.createUrlTree(routeCommands);
};
