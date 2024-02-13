import { NgModule } from '@angular/core';
import { NAVIGATOR_QUERY_PARAMS_CLEANUP, ViewRegistryService } from '@exense/step-core';
import { NoTotalCountPaginator } from './modules/_common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { AnalyticsPageComponent, ExecutionPerformanceComponent } from './modules/legacy';
import { TsNavigatorQueryParamsCleanupService } from './ts-navigator-query-params-cleanup.service';

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
      component: DashboardListComponent,
    });
    _viewRegistry.registerRoute({
      path: 'dashboards/:id',
      component: DashboardComponent,
    });
  }
}
