import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { TimeSeriesChartComponent } from './chart/time-series-chart.component';
import { ExecutionTabsComponent } from './execution-page/tabs/execution-tabs.component';
import { TSRangerComponent } from './ranger/ts-ranger.component';
import { TableModule } from '@exense/step-core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { TimeseriesTableComponent } from './execution-page/table/timeseries-table.component';
import { TimeRangePicker } from './time-selection/time-range-picker.component';
import { ChartSkeletonComponent } from './chart/skeleton/chart-skeleton.component';
import { ExecutionPageTimeSelectionComponent } from './execution-page/time-selection/execution-page-time-selection.component';
import { ExecutionFiltersComponent } from './execution-page/filters/execution-filters.component';
import { PerformanceViewComponent } from './execution-page/performance-view.component';

@NgModule({
  declarations: [
    PerformanceViewComponent,
    TimeSeriesChartComponent,
    ExecutionTabsComponent,
    TSRangerComponent,
    TimeseriesTableComponent,
    TimeRangePicker,
    ChartSkeletonComponent,
    ExecutionPageTimeSelectionComponent,
    ExecutionFiltersComponent,
  ],
  exports: [PerformanceViewComponent],
  imports: [StepCoreModule, TableModule, FormsModule, MatTableModule, CommonModule],
})
export class TimeSeriesModule {}
