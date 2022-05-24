import {PLUGINS_INITIALIZER} from "../../plugins-initializer/plugins-initializer";
import { NgModule } from "@angular/core";
import { StepCoreModule } from '@exense/step-core';
import {ExecutionPageComponent} from "./execution-page/execution-page.component";
import {TimeSeriesChartComponent} from "./chart/time-series-chart.component";
import {ExecutionTabsComponent} from './execution-page/tabs/execution-tabs.component';

@NgModule({
  declarations: [ExecutionPageComponent, TimeSeriesChartComponent, ExecutionTabsComponent],
  exports: [ExecutionPageComponent],
  imports: [StepCoreModule],
})
export class TimeSeriesModule {
}
