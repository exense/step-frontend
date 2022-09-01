import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { StepGeneratedClientModule } from '../generated';

@NgModule({
  imports: [HttpClientModule, StepGeneratedClientModule],
  providers: [],
})
export class StepAugmentedClientModule {}

export type { ExecutionSummaryDto } from './models/execution-summary-dto';
export type { ProjectDto } from './models/project-dto';
export type { ProjectMemberDto } from './models/project-member-dto';
export type { AugmentedTokenWrapperOwner } from './models/augmented-token-wrapper-owner';

export { AugmentedPlansService } from './services/augmented-plans-service';
export { AugmentedExecutionsService } from './services/augmented-executions-service';
export { AugmentedParametersService } from './services/augmented-parameters-service';
export { AugmentedResourcesService } from './services/augmented-resources-service';
export { AugmentedSchedulerService } from './services/augmented-scheduler-service';
export { AugmentedKeywordPackagesService } from './services/augmented-keyword-packages.service';
export { AugmentedKeywordsService } from './services/augmented-keywords-service';
export { AugmentedScreenService } from './services/augmented-screen.service';
export { AugmentedAdminService } from './services/augmented-admin-service';
export { pollAsyncTask } from './rxjs-operators/poll-async-task';
export { AsyncTaskStatus } from './shared/async-task-status';
