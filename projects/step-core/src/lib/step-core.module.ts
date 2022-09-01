import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UpgradeModule } from '@angular/upgrade/static';
import { TooltipDirective } from './directives/tooltip.directive';
import { CORE_INITIALIZER } from './core-initialiser';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { HasRightPipe } from './pipes/has-right.pipe';
import { MatchingAuthenticator } from './pipes/matching-authenticator.pipe';
import { DashboardLinkPipe } from './pipes/dashboard-link.pipe';
import { TableModule } from './modules/table/table.module';
import { StepBasicsModule } from './modules/basics/step-basics.module';
import { MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { EntityModule } from './modules/entity/entity.module';
import { StepGeneratedClientModule } from './client/generated';
import { EntitiesSelectionModule } from './modules/entities-selection/entities-selection.module';
import { CapsLockDirective } from './directives/caps-lock.directive';
import { CustomRegistriesModule } from './modules/custom-registeries/custom-registries.module';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { TabsModule } from './modules/tabs/tabs.module';

@NgModule({
  declarations: [
    TooltipDirective,
    HasRightPipe,
    MatchingAuthenticator,
    DashboardLinkPipe,
    CapsLockDirective,
    ArrayFilterComponent,
    DateFilterComponent,
  ],
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
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    TabsModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    TooltipDirective,
    CapsLockDirective,
    StepMaterialModule,
    HasRightPipe,
    MatchingAuthenticator,
    DashboardLinkPipe,
    TableModule,
    StepBasicsModule,
    EntityModule,
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    ArrayFilterComponent,
    DateFilterComponent,
    TabsModule,
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
export * from './services/async-task.service';
export * from './services/link-processor.service';
export * from './services/deferred-link-processor.service';
export * from './services/scheduled-task-dialogs.service';
export * from './services/view-state.service';
export * from './services/context.service';
export * from './services/plugin-info-registry.service';
export * from './services/additional-right-rule.service';
export * from './services/artefact-types.service';
export * from './services/report-node-commons.service';
export { UibModalInstance, UibModalHelperService } from './services/uib-modal-helper.service';
export * from './angularjs';
export * from './directives/tooltip.directive';
export * from './directives/caps-lock.directive';
export * from './pipes/has-right.pipe';
export * from './pipes/matching-authenticator.pipe';
export * from './pipes/dashboard-link.pipe';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
export * from './modules/basics/step-basics.module';
export * from './modules/entity/entity.module';
export * from './modules/entities-selection/entities-selection.module';
export * from './client/generated/index';
export * from './client/step-client-module';
export * from './modules/custom-registeries/custom-registries.module';
export * from './modules/tabs/tabs.module';

export { ApiError } from './client/generated/core/ApiError';
export { BaseHttpRequest } from './client/generated/core/BaseHttpRequest';
export { CancelablePromise, CancelError } from './client/generated/core/CancelablePromise';
export { OpenAPI } from './client/generated/core/OpenAPI';
export type { OpenAPIConfig } from './client/generated/core/OpenAPI';
export { ArrayFilterComponent } from './components/array-filter/array-filter.component';
export { DateFilterComponent } from './components/date-filter/date-filter.component';
