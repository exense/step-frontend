import { inject, NgModule } from '@angular/core';
import {
  AugmentedDashboardsService,
  AugmentedTimeSeriesService,
  checkEntityGuardFactory,
  DashboardsService,
  dialogRoute,
  EntityRegistry,
  NAVIGATOR_QUERY_PARAMS_CLEANUP,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { NoTotalCountPaginator } from './modules/_common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { NewDashboardDialogComponent } from './components/new-dashboard-dialog/new-dashboard-dialog.component';
import { DashboardNavigatorQueryParamsCleanupService } from './modules/_common/injectables/dashboard-navigator-query-params-cleanup.service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { map } from 'rxjs';
import { DashboardPageComponent } from './components/dashboard-page/dashboard-page.component';
import { AnalyticsPageComponent } from './components/analytics-page/analytics-page.component';
import { DashboardBulkOperationsRegisterService } from './modules/injectables/dashboard-bulk-operations-register.service';
import { ExecutionDashboardComponent } from './components/execution-page/execution-dashboard.component';
import { ChartDashletComponent } from './components/chart-dashlet/chart-dashlet.component';
import { StandaloneChartComponent } from './components/standalone-chart/standalone-chart.component';

@NgModule({
  imports: [
    AnalyticsPageComponent,
    ExecutionDashboardComponent,
    DashboardComponent,
    DashboardListComponent,
    ChartDashletComponent,
    StandaloneChartComponent,
  ],
  exports: [
    AnalyticsPageComponent,
    ExecutionDashboardComponent,
    DashboardComponent,
    DashboardListComponent,
    ChartDashletComponent,
    StandaloneChartComponent,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: NoTotalCountPaginator,
    },
    {
      provide: NAVIGATOR_QUERY_PARAMS_CLEANUP,
      useClass: DashboardNavigatorQueryParamsCleanupService,
      multi: true,
    },
  ],
})
export class TimeSeriesModule {
  constructor(
    _viewRegistry: ViewRegistryService,
    _entityRegistry: EntityRegistry,
    _bulkOperations: DashboardBulkOperationsRegisterService,
  ) {
    _bulkOperations.register();
    _entityRegistry.register('dashboard', 'Dashboard', { icon: 'dashboard' });
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
            checkEntityGuardFactory({
              entityType: 'dashboard',
              getEntity: (id) => inject(AugmentedDashboardsService).getDashboardById(id),
              getEditorUrl: (id) => `/dashboards/${id}`,
            }),
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
          resolve: {
            dashboard: (route: ActivatedRouteSnapshot) => {
              const id = route.params['id'];
              return inject(AugmentedDashboardsService).getDashboardById(id);
            },
          },
          component: DashboardPageComponent,
        },
      ],
    });
  }
}

export { StandaloneChartConfig } from './components/standalone-chart/standalone-chart-config';
export { FilterBarItem, FilterBarItemType } from './modules/_common';
