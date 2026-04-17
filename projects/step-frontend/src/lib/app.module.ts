import { Inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideStepApi,
  StepCoreModule,
  BaseHttpRequest,
  StepHttpRequestService,
  KEYWORDS_COMMON_INITIALIZER,
  CLI_MODE,
  MenuEntry,
  MenuItemsOverrideConfigService,
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
import { InProgressComponent } from './components/in-progress/in-progress.component';
import { of } from 'rxjs';

Settings.defaultLocale = 'en';

const MODULES_INITIALIZERS = [
  KEYWORDS_COMMON_INITIALIZER,
  AUTOMATION_PACKAGE_INITIALIZER,
  ERRORS_VIEW_INITIALIZER,
  RESOURCES_INITIALIZER,
];

const cliMenuItem = (item: Omit<MenuEntry, 'isVisibleFunction' | 'isEnabledFunction'>): MenuEntry => ({
  ...item,
  isVisibleFunction: () => true,
  isEnabledFunction: () => true,
});

const CLI_MENU_ITEMS: MenuEntry[] = [
  cliMenuItem({ id: 'automation-root', title: 'Design', icon: 'edit', weight: 10 }),
  cliMenuItem({
    id: 'functions',
    title: 'Keywords',
    icon: 'keyword',
    weight: 10,
    parentId: 'automation-root',
  }),
  cliMenuItem({
    id: 'plans',
    title: 'Plans',
    icon: 'plan',
    weight: 20,
    parentId: 'automation-root',
  }),
  cliMenuItem({
    id: 'parameters',
    title: 'Parameters',
    icon: 'list',
    weight: 30,
    parentId: 'automation-root',
  }),
  cliMenuItem({
    id: 'scheduler',
    title: 'Schedules',
    icon: 'clock',
    weight: 40,
    parentId: 'automation-root',
  }),
  cliMenuItem({ id: 'execute-root', title: 'Reporting', icon: 'file-check-03', weight: 20 }),
  cliMenuItem({
    id: 'executions',
    title: 'Executions',
    icon: 'rocket',
    weight: 10,
    parentId: 'execute-root',
  }),
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
    InProgressComponent,
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
export class AppModule {
  constructor(_menuItemsOverrideConfig: MenuItemsOverrideConfigService, @Inject(CLI_MODE) _cliMode: boolean) {
    const globalCliMode = (globalThis as { __STEP_CLI_MODE?: boolean }).__STEP_CLI_MODE;
    const isCliMode = typeof globalCliMode === 'boolean' ? globalCliMode : _cliMode;

    if (isCliMode) {
      _menuItemsOverrideConfig.configure(of(CLI_MENU_ITEMS));
    }
  }
}

export * from './components/root/root.component';
export * from './components/main-view/main-view.component';
