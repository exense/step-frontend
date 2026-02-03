import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../injectables/auth.service';
import { DEFAULT_PAGE, NavigatorService } from '../../routing';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot) => {
  const _authService = inject(AuthService);
  const _navigator = inject(NavigatorService);

  if (!_authService.getConf()?.authentication || _authService.isAuthenticated()) {
    return true;
  }

  _navigator.navigateLogin(_route.queryParams);
  return false;
};

export const nonAuthGuard: CanActivateFn = () => {
  const _authService = inject(AuthService);
  if (!!_authService.getConf()?.authentication && !_authService.isAuthenticated()) {
    return true;
  }

  const _router = inject(Router);
  const _defaultPage = inject(DEFAULT_PAGE);
  return _router.parseUrl(_defaultPage());
};
