import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { LoginComponent } from './modules/_common/step-common.module';
import { APP_INITIALIZER, FactoryProvider, inject } from '@angular/core';
import { AdditionalInitializationService, authGuard, AuthService, DEFAULT_PAGE, nonAuthGuard } from '@exense/step-core';
import { map, take } from 'rxjs';
import { MainViewComponent } from './components/main-view/main-view.component';
import { Location } from '@angular/common';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { InProgressComponent } from './components/in-progress/in-progress.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    canActivate: [
      () =>
        inject(AuthService).initialize$.pipe(
          take(1),
          map(() => true),
        ),
    ],
    children: [
      {
        path: '',
        component: MainViewComponent,
        children: [
          {
            path: 'in-progress',
            component: InProgressComponent,
            canActivate: [
              () => {
                const _router = inject(Router);
                const goTo = _router.getCurrentNavigation()?.extras?.state?.['goTo'] as string | undefined;
                return !!goTo;
              },
            ],
            resolve: {
              goTo: () => inject(Router).getCurrentNavigation()?.extras?.state?.['goTo'],
            },
          },
        ],
        canActivate: [
          authGuard,
          (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
            inject(AdditionalInitializationService).initialize(route, state).pipe(take(1)),
        ],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [nonAuthGuard],
      },
      {
        path: '**',
        component: NotFoundComponent,
        canActivate: [authGuard],
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

export const LEGACY_URL_HANDLER: FactoryProvider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const _location = inject(Location);
    return () => {
      let path = _location.path(true);
      if (path.includes('/root')) {
        path = path.replace('/root', '');
        if (!path.startsWith('/')) {
          path = `/${path}`;
        }
        _location.go(path);
      }
      return true;
    };
  },
};
