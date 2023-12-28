import { Router, Routes } from '@angular/router';
import { LoginComponent } from './modules/_common/step-common.module';
import { APP_INITIALIZER, FactoryProvider, inject } from '@angular/core';
import { authGuard, AuthService, DEFAULT_PAGE, nonAuthGuard } from '@exense/step-core';
import { map, take } from 'rxjs';
import { MainViewComponent } from './components/main-view/main-view.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    canActivate: [
      () =>
        inject(AuthService).initialize$.pipe(
          take(1),
          map(() => true)
        ),
    ],
    children: [
      {
        path: '',
        component: MainViewComponent,
        children: [],
        canActivate: [authGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [nonAuthGuard],
      },
    ],
  },
];

export const DEFAULT_ROUTE_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const _router = inject(Router);
    const _defaultPage = inject(DEFAULT_PAGE);
    return () => {
      const root = _router.config[0].children?.find((route) => route.path === '');
      if (!root) {
        return true;
      }
      root.children = root.children ?? [];
      const hasAlreadyRedirectRoute = root.children.some((route) => route.path === '');
      if (hasAlreadyRedirectRoute) {
        return true;
      }

      root.children.unshift({
        path: '',
        redirectTo: _defaultPage(),
        pathMatch: 'full',
      });

      return true;
    };
  },
};
