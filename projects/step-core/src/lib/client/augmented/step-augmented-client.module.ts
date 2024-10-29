import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { StepGeneratedClientModule } from '../generated';
import { StepTableClientModule } from '../table/step-table-client.module';

@NgModule({
  imports: [HttpClientModule, StepGeneratedClientModule, StepTableClientModule],
  providers: [],
})
export class StepAugmentedClientModule {}

export type { ExecutionSummaryDto } from './models/execution-summary-dto';
export type { AugmentedTokenWrapperOwner } from './models/augmented-token-wrapper-owner';
export type { AugmentedPlan } from './models/augmented-plan';
export type { ReportNodeExt } from './models/report-node-ext';
export { AugmentedPlansService } from './services/augmented-plans.service';
export { AugmentedExecutionsService } from './services/augmented-executions.service';
export { AugmentedParametersService } from './services/augmented-parameters.service';
export { AugmentedResourcesService } from './services/augmented-resources.service';
export { AugmentedSchedulerService } from './services/augmented-scheduler.service';
export { AugmentedKeywordPackagesService } from './services/augmented-keyword-packages.service';
export { AugmentedKeywordsService } from './services/augmented-keywords.service';
export { AugmentedScreenService } from './services/augmented-screen.service';
export { AugmentedSettingsService } from './services/augmented-settings.service';
export { AugmentedKeywordEditorService } from './services/augmented-keyword-editor.service';
export { AugmentedControllerService } from './services/augmented-controller.service';
export { AugmentedInteractivePlanExecutionService } from './services/augmented-interactive-plan-execution.service';
export { AssignEntityParameters } from './shared/assign-entity-parameters';
export { AugmentedUserService } from './services/augmented-user.service';
export { AugmentedQuotaManagerService } from './services/augmented-quota-manager.service';
export { AugmentedAutomationPackagesService } from './services/augmented-automation-packages.service';
export { AugmentedBookmarksService } from './services/augmented-bookmarks.service';
export { AugmentedTimeSeriesService } from './services/augmented-time-series.service';
export { AugmentedDashboardsService } from './services/augmented-dashboards.service';
export { StepHttpRequestService } from './services/step-http-request.service';
export * from './services/http-override-response-interceptor.service';
export * from './services/http-request-context-holder.service';
export * from './shared/pipe-operators';
export * from './shared/keyword';
export * from './shared/http-override-response-interceptor';
export * from './shared/token-provisioning-status';
export * from './models/dynamic-value-complex-types';
