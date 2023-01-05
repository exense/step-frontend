import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { AngularSplitModule } from 'angular-split';
import { StepGeneratedClientModule } from './client/generated';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { DynamicTextfieldComponent } from './components/dynamic-textfield/dynamic-textfield.component';
import { ExpressionInputComponent } from './components/expression-input/expression-input.component';
import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';
import { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';
import { ReportNodeStatusComponent } from './components/report-node-status/report-node-status.component';
import { SelectPlanComponent } from './components/select-plan/select-plan.component';
import { CORE_INITIALIZER } from './core-initialiser';
import { CapsLockDirective } from './directives/caps-lock.directive';
import { TooltipImmediateCloseDirective } from './directives/tooltip-immediate-close.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { StepBasicsModule } from './modules/basics/step-basics.module';
import { CustomRegistriesModule } from './modules/custom-registeries/custom-registries.module';
import { EntitiesSelectionModule } from './modules/entities-selection/entities-selection.module';
import { EntityModule } from './modules/entity/entity.module';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { TableModule } from './modules/table/table.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { TreeModule } from './modules/tree/tree.module';
import { DashboardLinkPipe } from './pipes/dashboard-link.pipe';
import { MatchingAuthenticator } from './pipes/matching-authenticator.pipe';
import { PlanNamePipe } from './pipes/plan-name.pipe';

@NgModule({
  declarations: [
    TooltipDirective,
    MatchingAuthenticator,
    DashboardLinkPipe,
    CapsLockDirective,
    TooltipImmediateCloseDirective,
    ReportNodeStatusComponent,
    PlanLinkComponent,
    PlanNamePipe,
    ModalWindowComponent,
    IsUsedByListComponent,
    IsUsedByModalComponent,
    FunctionLinkComponent,
    ExpressionInputComponent,
    DynamicTextfieldComponent,
    SelectPlanComponent,
    AutorefreshToggleComponent,
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
    TreeModule,
    AngularSplitModule,
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
    MatchingAuthenticator,
    DashboardLinkPipe,
    TableModule,
    StepBasicsModule,
    EntityModule,
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    TabsModule,
    TooltipImmediateCloseDirective,
    TreeModule,
    AngularSplitModule,
    ReportNodeStatusComponent,
    PlanLinkComponent,
    PlanNamePipe,
    ModalWindowComponent,
    IsUsedByModalComponent,
    DynamicTextfieldComponent,
    SelectPlanComponent,
    AutorefreshToggleComponent,
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

export * from './angularjs';
export { BaseHttpRequest } from './client/generated/core/BaseHttpRequest';
export { CancelablePromise, CancelError } from './client/generated/core/CancelablePromise';
export { OpenAPI } from './client/generated/core/OpenAPI';
export type { OpenAPIConfig } from './client/generated/core/OpenAPI';
export * from './client/generated/index';
export * from './client/step-client-module';
export { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
export { DynamicTextfieldComponent } from './components/dynamic-textfield/dynamic-textfield.component';
export { ExpressionInputComponent } from './components/expression-input/expression-input.component';
export { FunctionLinkDialogService } from './components/function-link/function-link-dialog.service';
export { FunctionLinkComponent } from './components/function-link/function-link.component';
export { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
export { ModalWindowComponent } from './components/modal-window/modal-window.component';
export { PlanLinkComponent } from './components/plan-link/plan-link.component';
export * from './components/report-node-status/report-node-status.component';
export { SelectPlanComponent } from './components/select-plan/select-plan.component';
export * from './decorators/plugin';
export * from './directives/caps-lock.directive';
export * from './directives/tooltip-immediate-close.directive';
export * from './directives/tooltip.directive';
export * from './domain';
export * from './modules/async-operations/async-operations.module';
export * from './modules/basics/step-basics.module';
export * from './modules/custom-registeries/custom-registries.module';
export * from './modules/entities-selection/entities-selection.module';
export * from './modules/entity/entity.module';
export * from './modules/step-icons/step-icons.module';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
export * from './modules/tabs/tabs.module';
export * from './modules/tree/tree.module';
export * from './pipes/dashboard-link.pipe';
export * from './pipes/matching-authenticator.pipe';
export { PlanNamePipe } from './pipes/plan-name.pipe';
export * from './services/additional-right-rule.service';
export * from './services/dashboard.service';
export * from './services/deferred-link-processor.service';
export { ExportDialogsService } from './services/export-dialogs.service';
export { ImportDialogsService } from './services/import-dialogs.service';
export * from './services/invoke-run.service';
export { IsUsedByDialogService } from './services/is-used-by-dialog.service';
export * from './services/link-processor.service';
export { PlanDialogsService } from './services/plan-dialogs.service';
export * from './services/plugin-info-registry.service';
export * from './services/report-node-commons.service';
export * from './services/scheduled-task-dialogs.service';
export { UibModalHelperService, UibModalInstance } from './services/uib-modal-helper.service';
export * from './services/view-registry.service';
export * from './services/view-state.service';
export * from './shared';
