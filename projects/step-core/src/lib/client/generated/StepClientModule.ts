/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { NgModule} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AngularHttpRequest } from './core/AngularHttpRequest';
import { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { OpenAPI } from './core/OpenAPI';

import { AccessService } from './services/AccessService';
import { AdminService } from './services/AdminService';
import { CollectionsService } from './services/CollectionsService';
import { ControllerService } from './services/ControllerService';
import { DefaultService } from './services/DefaultService';
import { DocumentCompareService } from './services/DocumentCompareService';
import { EventBrokerService } from './services/EventBrokerService';
import { ExecutionsService } from './services/ExecutionsService';
import { ExportsService } from './services/ExportsService';
import { GridService } from './services/GridService';
import { HousekeepingService } from './services/HousekeepingService';
import { ImportsService } from './services/ImportsService';
import { InteractivePlanExecutionService } from './services/InteractivePlanExecutionService';
import { KeywordEditorService } from './services/KeywordEditorService';
import { KeywordPackagesService } from './services/KeywordPackagesService';
import { KeywordsService } from './services/KeywordsService';
import { MonitoringDashboardService } from './services/MonitoringDashboardService';
import { NotificationsService } from './services/NotificationsService';
import { ParametersService } from './services/ParametersService';
import { PlanEditorService } from './services/PlanEditorService';
import { PlansService } from './services/PlansService';
import { ProjectsService } from './services/ProjectsService';
import { QuotaManagerService } from './services/QuotaManagerService';
import { ReferencesService } from './services/ReferencesService';
import { ResourcesService } from './services/ResourcesService';
import { SchedulerService } from './services/SchedulerService';
import { ScreensService } from './services/ScreensService';
import { SettingsService } from './services/SettingsService';
import { SystemService } from './services/SystemService';
import { TablesService } from './services/TablesService';

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
        CollectionsService,
        ControllerService,
        DefaultService,
        DocumentCompareService,
        EventBrokerService,
        ExecutionsService,
        ExportsService,
        GridService,
        HousekeepingService,
        ImportsService,
        InteractivePlanExecutionService,
        KeywordEditorService,
        KeywordPackagesService,
        KeywordsService,
        MonitoringDashboardService,
        NotificationsService,
        ParametersService,
        PlanEditorService,
        PlansService,
        ProjectsService,
        QuotaManagerService,
        ReferencesService,
        ResourcesService,
        SchedulerService,
        ScreensService,
        SettingsService,
        SystemService,
        TablesService,
    ]
})
export class StepClientModule {}

