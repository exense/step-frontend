import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideStepApi,
  StepCoreModule,
  BaseHttpRequest,
  StepHttpRequestService,
  KEYWORDS_COMMON_INITIALIZER,
} from '@exense/step-core';
import { AdminModule } from './modules/admin/admin.module';
import { DefaultThemeModule } from './modules/default-theme/default-theme.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { FunctionModule } from './modules/function/function.module';
import { GridModule } from './modules/grid/grid.module';
import { ParameterModule } from './modules/parameter/parameter.module';
import { PlanModule } from './modules/plan/plan.module';
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
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { AUTOMATION_PACKAGE_IMPORTS, AUTOMATION_PACKAGE_INITIALIZER } from './modules/automation-packages';
import { ERRORS_VIEW_IMPORTS, ERRORS_VIEW_INITIALIZER } from './modules/errors-view';
import { RESOURCE_IMPORTS, RESOURCES_INITIALIZER } from './modules/resources';

Settings.defaultLocale = 'en';

const MODULES_INITIALIZERS = [
  KEYWORDS_COMMON_INITIALIZER,
  AUTOMATION_PACKAGE_INITIALIZER,
  ERRORS_VIEW_INITIALIZER,
  RESOURCES_INITIALIZER,
];

@NgModule({
  declarations: [RootComponent, MainViewComponent, NotFoundComponent],
  imports: [
    StepCommonModule,
    BrowserModule,
    StepCoreModule,
    ...ERRORS_VIEW_IMPORTS,
    AdminModule,
    PlanModule,
    FunctionModule,
    ...AUTOMATION_PACKAGE_IMPORTS,
    ExecutionModule,
    BrowserAnimationsModule,
    SchedulerModule,
    ParameterModule,
    GridModule,
    TimeSeriesModule,
    DefaultThemeModule,
    ArtefactsModule,
    ...RESOURCE_IMPORTS,
    BookmarksModule,
    RouterModule.forRoot(APP_ROUTES, { useHash: true }),
  ],
  exports: [RootComponent],
  providers: [
    provideStepApi(),
    LEGACY_URL_HANDLER,
    ...MODULES_INITIALIZERS,
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
