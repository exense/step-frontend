import {PLUGINS_INITIALIZER} from "../../plugins-initializer/plugins-initializer";
import { NgModule } from "@angular/core";
import { StepCoreModule } from '@exense/step-core';
import {ExecutionPageComponent} from "./execution-page/execution-page.component";
import {TimeSeriesChartComponent} from "./chart/time-series-chart.component";
import {ExecutionTabsComponent} from './execution-page/tabs/execution-tabs.component';
import {TsRangerComponent} from './ranger/ts-ranger.component';
import { TableModule } from '@exense/step-core';
import * as uPlot from "uplot"; // this is mandatory for compile

@NgModule({
  declarations: [ExecutionPageComponent, TimeSeriesChartComponent, ExecutionTabsComponent, TsRangerComponent],
  exports: [ExecutionPageComponent],
  imports: [StepCoreModule, TableModule],
})
export class TimeSeriesModule {
}
