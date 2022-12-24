import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { TimeSeriesChartComponent } from './chart/time-series-chart.component';
import { ExecutionTabsComponent } from './execution-page/tabs/execution-tabs.component';
import { TSRangerComponent } from './ranger/ts-ranger.component';
import { TableModule } from '@exense/step-core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { TimeseriesTableComponent } from './performance-view/table/timeseries-table.component';
import { TimeRangePicker } from './time-selection/time-range-picker.component';
import { ChartSkeletonComponent } from './chart/skeleton/chart-skeleton.component';
import { ExecutionFiltersComponent } from './performance-view/filters/execution-filters.component';
import { PerformanceViewComponent } from './performance-view/performance-view.component';
import { ExecutionPageComponent } from './execution-page/execution-page.component';
import { SyntheticMonitoringPageComponent } from './synthetic-monitoring/synthetic-monitoring-page.component';
import { MeasurementsPickerComponent } from './performance-view/measurements/measurements-picker.component';
import { PerformanceViewTimeSelectionComponent } from './performance-view/time-selection/performance-view-time-selection.component';
import { MeasurementsFilterPipe } from './performance-view/measurements/measurements-filter.pipe';
import { FilterBarComponent } from './performance-view/filter-bar/filter-bar.component';
import { FilterBarItemComponent } from './performance-view/filter-bar/item/filter-bar-item.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TimeSeriesDashboardComponent } from './dashboard/time-series-dashboard.component';
import { TsGroupingComponent } from './dashboard/grouping/ts-grouping.component';

@NgModule({
  declarations: [
    PerformanceViewComponent,
    TimeSeriesChartComponent,
    ExecutionTabsComponent,
    TSRangerComponent,
    TimeseriesTableComponent,
    TimeRangePicker,
    ChartSkeletonComponent,
    PerformanceViewTimeSelectionComponent,
    ExecutionFiltersComponent,
    ExecutionPageComponent,
    SyntheticMonitoringPageComponent,
    MeasurementsPickerComponent,
    MeasurementsFilterPipe,
    FilterBarComponent,
    FilterBarItemComponent,
    TimeSeriesDashboardComponent,
    TsGroupingComponent,
  ],
  exports: [PerformanceViewComponent],
  imports: [StepCoreModule, TableModule, FormsModule, MatTableModule, CommonModule, MatDatepickerModule],
})
export class TimeSeriesModule {}
