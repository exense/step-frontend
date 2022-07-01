import { PLUGINS_INITIALIZER } from '../../plugins-initializer/plugins-initializer';
import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { ExecutionPageComponent } from './execution-page/execution-page.component';
import { TimeSeriesChartComponent } from './chart/time-series-chart.component';
import { ExecutionTabsComponent } from './execution-page/tabs/execution-tabs.component';
import { TSRangerComponent } from './ranger/ts-ranger.component';
import { TableModule } from '@exense/step-core';
import * as uPlot from 'uplot';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { TimeseriesTableComponent } from './execution-page/table/timeseries-table.component'; // this is mandatory for compile

@NgModule({
  declarations: [
    ExecutionPageComponent,
    TimeSeriesChartComponent,
    ExecutionTabsComponent,
    TSRangerComponent,
    TimeseriesTableComponent,
  ],
  exports: [ExecutionPageComponent],
  imports: [StepCoreModule, TableModule, FormsModule, MatTableModule, CommonModule],
})
export class TimeSeriesModule {}
