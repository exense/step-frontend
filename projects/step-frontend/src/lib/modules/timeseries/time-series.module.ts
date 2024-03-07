import { inject, NgModule } from '@angular/core';
import {
  NAVIGATOR_QUERY_PARAMS_CLEANUP,
  dialogRoute,
  SimpleOutletComponent,
  ViewRegistryService,
  DashboardsService,
} from '@exense/step-core';
import { NoTotalCountPaginator } from './modules/_common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { NewDashboardDialogComponent } from './components/new-dashboard-dialog/new-dashboard-dialog.component';
import { AnalyticsPageComponent, ExecutionPerformanceComponent } from './modules/legacy';
import { TsNavigatorQueryParamsCleanupService } from './ts-navigator-query-params-cleanup.service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { map } from 'rxjs';

@NgModule({
  imports: [AnalyticsPageComponent, ExecutionPerformanceComponent, DashboardComponent, DashboardListComponent],
  exports: [AnalyticsPageComponent, ExecutionPerformanceComponent, DashboardComponent, DashboardListComponent],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: NoTotalCountPaginator,
    },
    {
      provide: NAVIGATOR_QUERY_PARAMS_CLEANUP,
      useClass: TsNavigatorQueryParamsCleanupService,
      multi: true,
    },
  ],
})
export class TimeSeriesModule {
  constructor(_viewRegistry: ViewRegistryService) {
    _viewRegistry.registerRoute({
      path: 'analytics',
      component: AnalyticsPageComponent,
    });
    _viewRegistry.registerRoute({
      path: 'dashboards',
      component: SimpleOutletComponent,
      children: [
        {
          path: '',
          component: DashboardListComponent,
          children: [
            dialogRoute({
              path: 'new',
              dialogComponent: NewDashboardDialogComponent,
            }),
          ],
        },
        {
          path: ':id',
          canActivate: [
            (route: ActivatedRouteSnapshot) => {
              const _dashboardService = inject(DashboardsService);
              const _router = inject(Router);

              return _dashboardService.getDashboardById(route.params['id']).pipe(
                map((dashboard) => {
                  if (!dashboard.metadata?.['isLegacy']) {
                    return true;
                  }
                  const link = dashboard.metadata?.['link'];
                  if (!link) {
                    console.error('No link specified for dashboard');
                    return false;
                  }

                  return _router.parseUrl(link);
                }),
              );
            },
          ],
          component: DashboardComponent,
        },
      ],
    });
  }
}
