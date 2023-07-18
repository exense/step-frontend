import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { TimeSeriesChartComponent } from './chart/time-series-chart.component';
import { TSRangerComponent } from './ranger/ts-ranger.component';
import { TableModule } from '@exense/step-core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { TimeseriesTableComponent } from './performance-view/table/timeseries-table.component';
import { TimeRangePicker } from './time-selection/time-range-picker.component';
import { ChartSkeletonComponent } from './chart/skeleton/chart-skeleton.component';
import { PerformanceViewComponent } from './performance-view/performance-view.component';
import { MeasurementsPickerComponent } from './performance-view/measurements/measurements-picker.component';
import { PerformanceViewTimeSelectionComponent } from './performance-view/time-selection/performance-view-time-selection.component';
import { MeasurementsFilterPipe } from './performance-view/measurements/measurements-filter.pipe';
import { FilterBarComponent } from './performance-view/filter-bar/filter-bar.component';
import { FilterBarItemComponent } from './performance-view/filter-bar/item/filter-bar-item.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TimeSeriesDashboardComponent } from './dashboard/time-series-dashboard.component';
import { TsGroupingComponent } from './dashboard/grouping/ts-grouping.component';
import { AnalyticsPageComponent } from './analytics/analytics-page.component';
import { ExecutionPerformanceComponent } from './execution-page/ts-execution-page.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TsToolbarComponent } from './dashboard/toolbar/ts-toolbar.component';
import { TsCompareModeComponent } from './dashboard/compare/compare-mode.component';
import { TsComparePercentagePipe } from './dashboard/compare/ts-compare-percentage.pipe';

@NgModule({
  declarations: [
    PerformanceViewComponent,
    TimeSeriesChartComponent,
    TSRangerComponent,
    TimeseriesTableComponent,
    TimeRangePicker,
    ChartSkeletonComponent,
    PerformanceViewTimeSelectionComponent,
    PerformanceViewComponent,
    MeasurementsPickerComponent,
    MeasurementsFilterPipe,
    FilterBarComponent,
    FilterBarItemComponent,
    TimeSeriesDashboardComponent,
    TsGroupingComponent,
    TsToolbarComponent,
    PerformanceViewComponent,
    AnalyticsPageComponent,
    ExecutionPerformanceComponent,
    TsCompareModeComponent,
    TsComparePercentagePipe,
  ],
  exports: [ExecutionPerformanceComponent, AnalyticsPageComponent],
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
  ],
})
export class TimeSeriesModule {}
