import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UpgradeModule } from '@angular/upgrade/static';
import { TooltipDirective } from './directives/tooltip.directive';
import { CORE_INITIALIZER } from './core-initialiser';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { HasRightPipe } from './pipes/has-right.pipe';
import { TableModule } from './modules/table/table.module';
import { StepBasicsModule } from './modules/basics/step-basics.module';
import { MAT_LUXON_DATE_ADAPTER_OPTIONS, MAT_LUXON_DATE_FORMATS } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { EntityModule } from './modules/entity/entity.module';
import { StepGeneratedClientModule } from './client/generated';

@NgModule({
  declarations: [TooltipDirective, HasRightPipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    StepMaterialModule,
    TableModule,
    StepBasicsModule,
    EntityModule,
    StepGeneratedClientModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    TooltipDirective,
    StepMaterialModule,
    HasRightPipe,
    TableModule,
    StepBasicsModule,
    EntityModule,
    StepGeneratedClientModule,
  ],
  providers: [
    CORE_INITIALIZER,
    {
      provide: MAT_LUXON_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: true },
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'dd.MM.yyyy',
        },
        display: {
          dateInput: 'dd.MM.yyyy',
          monthYearLabel: 'MMM yyyy',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM yyyy',
        },
      },
    },
  ],
})
export class StepCoreModule {}

export * from './domain';
export * from './shared';
export * from './decorators/plugin';
export * from './services/auth.service';
export * from './services/dashboard.service';
export * from './services/invoke-run.service';
export * from './services/view-registry.service';
export * from './services/deferred-view-registry.service';
export * from './services/async-task.service';
export * from './services/link-processor.service';
export * from './services/deferred-link-processor.service';
export * from './services/view-state.service';
export * from './services/context.service';
export * from './services/additional-right-rule.service';
export { UibModalInstance, UibModalHelperService } from './services/uib-modal-helper.service';
export * from './angularjs';
export * from './directives/tooltip.directive';
export * from './pipes/has-right.pipe';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
export * from './modules/basics/step-basics.module';
export * from './modules/entity/entity.module';
export * from './client/generated/index';
export * from './client/step-client-module';

export { ApiError } from './client/generated/core/ApiError';
export { BaseHttpRequest } from './client/generated/core/BaseHttpRequest';
export { CancelablePromise, CancelError } from './client/generated/core/CancelablePromise';
export { OpenAPI } from './client/generated/core/OpenAPI';
export type { OpenAPIConfig } from './client/generated/core/OpenAPI';
