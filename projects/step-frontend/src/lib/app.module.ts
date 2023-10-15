import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpgradeModule } from '@angular/upgrade/static';
import { AJS_MODULE, StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { AdminModule } from './modules/admin/admin.module';
import { DefaultThemeModule } from './modules/default-theme/default-theme.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { FunctionModule } from './modules/function/function.module';
import { GridModule } from './modules/grid/grid.module';
import { ParameterModule } from './modules/parameter/parameter.module';
import { PlanModule } from './modules/plan/plan.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { TimeSeriesModule } from './modules/timeseries/time-series.module';
import { ArtefactsModule } from './modules/artefacts/artefacts.module';
import { PLUGINS_INITIALIZER } from './plugins-initializer/plugins-initializer';
import { Settings } from 'luxon';
import { RouterModule, Routes } from '@angular/router';
import { LegacyOutletComponent } from './modules/_common/components/legacy-outlet/legacy-outlet.component';

Settings.defaultLocale = 'en';

const ROOT_ROUTES: Routes = [
  {
    path: 'root',
    children: [
      {
        matcher: ViewRegistryService.isMatchToLegacyRoutes,
        component: LegacyOutletComponent,
      },
    ],
  },
];

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
    ParameterModule,
    GridModule,
    TimeSeriesModule,
    DefaultThemeModule,
    ArtefactsModule,
    ResourcesModule,
    RouterModule.forRoot(ROOT_ROUTES, { useHash: true }),
  ],
  providers: [PLUGINS_INITIALIZER],
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [AJS_MODULE]);
  }
}
