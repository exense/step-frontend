import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavigatorService } from '../services/navigator.service';

export const authGuard: CanActivateFn = () => {
  const _authService = inject(AuthService);
  const _navigator = inject(NavigatorService);

  if (!_authService.getConf()?.authentication || _authService.isAuthenticated()) {
    return true;
  }

  _navigator.navigateLogin();
  return false;
};

export const nonAuthGuard: CanActivateFn = () => {
  const _authService = inject(AuthService);
  return !!_authService.getConf()?.authentication && !_authService.isAuthenticated();
};
