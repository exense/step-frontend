import { NgModule } from '@angular/core';
import { dialogRoute, SimpleOutletComponent, ViewRegistryService } from '@exense/step-core';
import { NoTotalCountPaginator } from './modules/_common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
import { NewDashboardDialogComponent } from './components/new-dashboard-dialog/new-dashboard-dialog.component';
import { AnalyticsPageComponent, ExecutionPerformanceComponent } from './modules/legacy';

@NgModule({
  imports: [AnalyticsPageComponent, ExecutionPerformanceComponent, DashboardComponent, DashboardListComponent],
  exports: [AnalyticsPageComponent, ExecutionPerformanceComponent, DashboardComponent, DashboardListComponent],
  providers: [{ provide: MatPaginatorIntl, useClass: NoTotalCountPaginator }],
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
          component: DashboardComponent,
        },
      ],
    });
  }
}
