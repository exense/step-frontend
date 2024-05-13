import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BaseHttpRequest, StepCoreModule, StepHttpRequestService } from '@exense/step-core';
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
import { RouterModule } from '@angular/router';
import { RootComponent } from './components/root/root.component';
import { StepCommonModule } from './modules/_common/step-common.module';
import { MainViewComponent } from './components/main-view/main-view.component';
import { APP_ROUTES, DEFAULT_ROUTE_INITIALIZER, LEGACY_URL_HANDLER } from './app.routes';
import { AutomationPackagesModule } from './modules/automation-packages/automation-packages.module';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';

Settings.defaultLocale = 'en';

@NgModule({
  declarations: [RootComponent, MainViewComponent, NotFoundComponent],
  imports: [
    StepCommonModule,
    BrowserModule,
    StepCoreModule,
    AdminModule,
    PlanModule,
    FunctionModule,
    AutomationPackagesModule,
    ExecutionModule,
    BrowserAnimationsModule,
    SchedulerModule,
    ParameterModule,
    GridModule,
    TimeSeriesModule,
    DefaultThemeModule,
    ArtefactsModule,
    ResourcesModule,
    BookmarksModule,
    RouterModule.forRoot(APP_ROUTES, { useHash: true }),
  ],
  exports: [RootComponent],
  providers: [
    LEGACY_URL_HANDLER,
    PLUGINS_INITIALIZER,
    DEFAULT_ROUTE_INITIALIZER,
    {
      provide: BaseHttpRequest,
      useExisting: StepHttpRequestService,
    },
  ],
  bootstrap: [RootComponent],
})
export class AppModule {}

export * from './components/root/root.component';
export * from './components/main-view/main-view.component';
