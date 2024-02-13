import { NgModule } from '@angular/core';
import {
  dialogRoute,
  EntityModule,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { TimeSeriesChartComponent } from './chart/time-series-chart.component';
import { TSRangerComponent } from './ranger/ts-ranger.component';
import { TableModule } from '@exense/step-core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { TimeseriesTableComponent } from './performance-view/table/timeseries-table.component';
import { TimeRangePickerComponent } from './time-selection/time-range-picker.component';
import { ChartSkeletonComponent } from './chart/skeleton/chart-skeleton.component';
import { MeasurementsPickerComponent } from './performance-view/measurements/measurements-picker.component';
import { PerformanceViewTimeSelectionComponent } from './performance-view/time-selection/performance-view-time-selection.component';
import { MeasurementsFilterPipe } from './performance-view/measurements/measurements-filter.pipe';
import { FilterBarComponent } from './performance-view/filter-bar/legacy/filter-bar.component';
import { FilterBarItemComponent } from './performance-view/filter-bar/item/filter-bar-item.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TimeSeriesDashboardComponent } from './dashboard/time-series-dashboard.component';
import { TsGroupingComponent } from './dashboard/grouping/ts-grouping.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';
import { ExecutionPerformanceComponent } from './pages/execution-page/ts-execution-page.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DiscoverComponent } from './discover/discover.component';
import { DiscoverAttributeStatsComponent } from './discover/attribute-stats/attribute-stats.component';
import { ViewRegistryService } from '@exense/step-core';
import { NoTotalCountPaginator } from './modules/_common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardListComponent } from './components/dashboard-list/dashboard-list.component';
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
