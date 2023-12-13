import { NgModule } from '@angular/core';
import { EntityModule, SimpleOutletComponent, StepCoreModule, ViewRegistryService } from '@exense/step-core';
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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { NoTotalCountPaginator } from './discover/no-total-count-paginator';
import { ChartsViewComponent } from './performance-view/charts-view.component';
import { TsComparePercentagePipe } from './dashboard/compare/ts-compare-percentage.pipe';
import { FilterBarExecutionItemComponent } from './performance-view/filter-bar/item/execution/filter-bar-execution-item.component';
import { FilterBarTaskItemComponent } from './performance-view/filter-bar/item/task/filter-bar-task-item.component';
import { ReportNodesModule } from '../report-nodes/report-nodes.module';
import { FilterBarPlanItemComponent } from './performance-view/filter-bar/item/plan/filter-bar-plan-item.component';
import { MetricChartComponent } from './metric-chart/metric-chart.component';
import { ResolutionPickerComponent } from './components/resolution-picker/resolution-picker.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { PlanListComponent } from '../plan/components/plan-list/plan-list.component';
import { PlanEditorComponent } from '../plan/components/plan-editor/plan-editor.component';
import { ChartDashletComponent } from './pages/dashboard/chart-dashlet/chart-dashlet.component';
import { DashboardFilterBarComponent } from './performance-view/filter-bar/dashboard-filter-bar.component';

@NgModule({
  declarations: [
    ChartsViewComponent,
    TimeSeriesChartComponent,
    TSRangerComponent,
    TimeseriesTableComponent,
    TimeRangePickerComponent,
    ChartSkeletonComponent,
    PerformanceViewTimeSelectionComponent,
    MeasurementsPickerComponent,
    MeasurementsFilterPipe,
    FilterBarComponent,
    FilterBarItemComponent,
    TimeSeriesDashboardComponent,
    TsGroupingComponent,
    AnalyticsPageComponent,
    FilterBarPlanItemComponent,
    ExecutionPerformanceComponent,
    TsComparePercentagePipe,
    DiscoverComponent,
    DiscoverAttributeStatsComponent,
    FilterBarExecutionItemComponent,
    FilterBarTaskItemComponent,
    MetricChartComponent,
    ResolutionPickerComponent,
    DashboardPageComponent,
    ChartDashletComponent,
    DashboardFilterBarComponent,
  ],
  exports: [ExecutionPerformanceComponent, DashboardPageComponent, AnalyticsPageComponent, MetricChartComponent],
  providers: [{ provide: MatPaginatorIntl, useClass: NoTotalCountPaginator }],
  imports: [
    StepCoreModule,
    TableModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    ReportNodesModule,
    EntityModule,
  ],
})
export class TimeSeriesModule {
  constructor(_viewRegistry: ViewRegistryService) {
    _viewRegistry.registerRoute({
      path: 'dashboards',
      component: DashboardPageComponent,
    });
  }
}
