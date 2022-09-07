/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AngularHttpRequest } from './core/AngularHttpRequest';
import { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { OpenAPI } from './core/OpenAPI';

import { AccessService } from './services/AccessService';
import { AdminService } from './services/AdminService';
import { AsyncTasksService } from './services/AsyncTasksService';
import { CollectionsService } from './services/CollectionsService';
import { ControllerService } from './services/ControllerService';
import { ExecutionsService } from './services/ExecutionsService';
import { ExportsService } from './services/ExportsService';
import { GridService } from './services/GridService';
import { ImportsService } from './services/ImportsService';
import { InteractivePlanExecutionService } from './services/InteractivePlanExecutionService';
import { KeywordEditorService } from './services/KeywordEditorService';
import { KeywordPackagesService } from './services/KeywordPackagesService';
import { KeywordsService } from './services/KeywordsService';
import { ParametersService } from './services/ParametersService';
import { PlansService } from './services/PlansService';
import { PrivateApplicationService } from './services/PrivateApplicationService';
import { PrivateDataPoolPluginService } from './services/PrivateDataPoolPluginService';
import { PrivateStagingRepositoryService } from './services/PrivateStagingRepositoryService';
import { PrivateViewPluginService } from './services/PrivateViewPluginService';
import { QuotaManagerService } from './services/QuotaManagerService';
import { ReferencesService } from './services/ReferencesService';
import { ResourcesService } from './services/ResourcesService';
import { RtmService } from './services/RtmService';
import { SchedulerService } from './services/SchedulerService';
import { ScreensService } from './services/ScreensService';
import { SettingsService } from './services/SettingsService';
import { SystemService } from './services/SystemService';
import { TablesService } from './services/TablesService';
import { TimeSeriesService } from './services/TimeSeriesService';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: OpenAPI,
      useValue: {
        BASE: OpenAPI?.BASE ?? '/rest',
        VERSION: OpenAPI?.VERSION ?? '3.20.0',
        WITH_CREDENTIALS: OpenAPI?.WITH_CREDENTIALS ?? false,
        CREDENTIALS: OpenAPI?.CREDENTIALS ?? 'include',
        TOKEN: OpenAPI?.TOKEN,
        USERNAME: OpenAPI?.USERNAME,
        PASSWORD: OpenAPI?.PASSWORD,
        HEADERS: OpenAPI?.HEADERS,
        ENCODE_PATH: OpenAPI?.ENCODE_PATH,
      } as OpenAPIConfig,
    },
    {
      provide: BaseHttpRequest,
      useClass: AngularHttpRequest,
    },
    AccessService,
    AdminService,
    AsyncTasksService,
    CollectionsService,
    ControllerService,
    ExecutionsService,
    ExportsService,
    GridService,
    ImportsService,
    InteractivePlanExecutionService,
    KeywordEditorService,
    KeywordPackagesService,
    KeywordsService,
    ParametersService,
    PlansService,
    PrivateApplicationService,
    PrivateDataPoolPluginService,
    PrivateStagingRepositoryService,
    PrivateViewPluginService,
    QuotaManagerService,
    ReferencesService,
    ResourcesService,
    RtmService,
    SchedulerService,
    ScreensService,
    SettingsService,
    SystemService,
    TablesService,
    TimeSeriesService,
  ],
})
export class StepGeneratedClientModule {}
