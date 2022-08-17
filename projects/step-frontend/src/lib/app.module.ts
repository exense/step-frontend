import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { StepCoreModule, AJS_MODULE } from '@exense/step-core';
import { AdminModule } from './modules/admin/admin.module';
import { PlanModule } from './modules/plan/plan.module';
import { PLUGINS_INITIALIZER } from './plugins-initializer/plugins-initializer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExecutionModule } from './modules/execution/execution.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ContextMenuModule } from './modules/context-menu/context-menu.module';
import { ParameterModule } from './modules/parameter/parameter.module';
import { FunctionModule } from './modules/function/function.module';
import { TimeSeriesModule } from './modules/timeseries/time-series.module';
import { GridModule } from './modules/grid/grid.module';
import { GenericFunctionModule } from './modules/mask/generic-function.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    UpgradeModule,
    StepCoreModule,
    AdminModule,
    PlanModule,
    FunctionModule,
    ExecutionModule,
    BrowserAnimationsModule,
    SchedulerModule,
    ContextMenuModule,
    ParameterModule,
    GridModule,
    TimeSeriesModule,
    GenericFunctionModule,
  ],
  providers: [PLUGINS_INITIALIZER],
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [AJS_MODULE]);
  }
}
